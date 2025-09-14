import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import { 
  users, 
  freelancerProfiles, 
  jobs, 
  applications, 
  reviews, 
  messages
} from "../../shared/schema.js";
import { inArray } from "drizzle-orm";
import fs from "fs";
import path from "path";

neonConfig.webSocketConstructor = ws;

// ============= SAFETY CONFIGURATION =============
const REQUIRED_ENV_VAR = "ALLOW_PROD_SEED";
const CONFIRM_VAR = "CONFIRM_ROLLBACK";

// Environment validation
function validateEnvironment() {
  if (process.env.NODE_ENV !== "production") {
    console.error("❌ This script is only for production environment");
    console.error(`Current NODE_ENV: ${process.env.NODE_ENV}`);
    process.exit(1);
  }

  if (!process.env[REQUIRED_ENV_VAR] || process.env[REQUIRED_ENV_VAR] !== "true") {
    console.error(`❌ Missing required environment variable: ${REQUIRED_ENV_VAR}=true`);
    process.exit(1);
  }

  if (!process.env[CONFIRM_VAR] || process.env[CONFIRM_VAR] !== "true") {
    console.error(`❌ Missing rollback confirmation: ${CONFIRM_VAR}=true`);
    console.error("This is a safety measure to prevent accidental rollback");
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not found");
    process.exit(1);
  }
}

// ============= DATABASE CONNECTION =============
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle({ client: pool });

// ============= ROLLBACK FUNCTIONS =============
function findSeedLogFile(): string | null {
  const currentDir = process.cwd();
  const files = fs.readdirSync(currentDir);
  const seedLogFiles = files.filter(f => f.startsWith('seeds-') && f.endsWith('.json'));
  
  if (seedLogFiles.length === 0) {
    return null;
  }
  
  if (seedLogFiles.length === 1) {
    return path.join(currentDir, seedLogFiles[0]);
  }
  
  // If multiple files, show them and ask user to specify
  console.log("📄 Multiple seed log files found:");
  seedLogFiles.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
  });
  console.log("\n💡 Please specify the seed tag to rollback:");
  console.log("ROLLBACK_SEED_TAG=prod-seed-2025 npm run rollback-seed");
  return null;
}

function loadSeedLog(seedTag?: string): any {
  let logFile: string | null = null;
  
  if (seedTag) {
    logFile = path.join(process.cwd(), `seeds-${seedTag}.json`);
    if (!fs.existsSync(logFile)) {
      console.error(`❌ Seed log file not found: ${logFile}`);
      process.exit(1);
    }
  } else {
    logFile = findSeedLogFile();
    if (!logFile) {
      console.error("❌ No seed log files found or multiple files exist");
      console.error("Run seeding first or specify ROLLBACK_SEED_TAG");
      process.exit(1);
    }
  }

  try {
    const logData = JSON.parse(fs.readFileSync(logFile, 'utf-8'));
    console.log(`📄 Loading seed log: ${logFile}`);
    console.log(`🏷️  Seed tag: ${logData.tag}`);
    console.log(`📅 Created: ${logData.timestamp}`);
    return { logData, logFile };
  } catch (error) {
    console.error(`❌ Failed to read seed log: ${error}`);
    process.exit(1);
  }
}

async function rollbackTable(tableName: string, table: any, ids: string[], isDryRun: boolean): Promise<void> {
  if (ids.length === 0) {
    console.log(`📋 ${tableName}: No records to rollback`);
    return;
  }

  console.log(`\n📋 ${tableName}: ${isDryRun ? 'DRY RUN' : 'ROLLING BACK'} ${ids.length} records...`);
  
  if (isDryRun) {
    console.log(`  ✅ Would delete ${ids.length} ${tableName} records`);
    return;
  }

  try {
    const result = await db.delete(table).where(inArray(table.id, ids));
    console.log(`  ✅ Deleted ${result.rowCount || 0} ${tableName} records`);
  } catch (error) {
    console.error(`  ❌ Failed to rollback ${tableName}:`, error);
    throw error;
  }
}

async function runRollback(seedTag?: string, isDryRun: boolean = false) {
  console.log(`\n🔄 Starting rollback ${isDryRun ? '(DRY RUN)' : ''}`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV}`);

  const { logData, logFile } = loadSeedLog(seedTag);
  const seedIds = logData.seedIds;

  if (!isDryRun) {
    console.log(`\n⚠️  WARNING: This will DELETE data from PRODUCTION database!`);
    console.log(`⚠️  Seed tag: ${logData.tag}`);
    console.log(`⚠️  Records to delete:`);
    Object.entries(seedIds).forEach(([table, ids]: [string, any]) => {
      console.log(`    - ${table}: ${ids.length} records`);
    });
  }

  try {
    // Delete in reverse dependency order to avoid foreign key conflicts
    await rollbackTable('messages', messages, seedIds.messages || [], isDryRun);
    await rollbackTable('reviews', reviews, seedIds.reviews || [], isDryRun);
    await rollbackTable('applications', applications, seedIds.applications || [], isDryRun);
    await rollbackTable('jobs', jobs, seedIds.jobs || [], isDryRun);
    await rollbackTable('freelancer_profiles', freelancerProfiles, seedIds.freelancer_profiles || [], isDryRun);
    await rollbackTable('users', users, seedIds.users || [], isDryRun);

    if (!isDryRun) {
      // Archive the seed log file
      const archiveFile = logFile.replace('.json', '_rolled_back.json');
      fs.renameSync(logFile, archiveFile);
      console.log(`📄 Seed log archived: ${archiveFile}`);
    }

    console.log(`\n✅ Rollback completed successfully!`);

  } catch (error) {
    console.error(`\n❌ Rollback failed:`, error);
    console.error("🚨 Database may be in inconsistent state!");
    console.error("🔧 Manual intervention may be required");
    throw error;
  } finally {
    await pool.end();
  }
}

// ============= CLI HANDLING =============
async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const seedTag = process.env.ROLLBACK_SEED_TAG;

  console.log(`\n🔙 Production Rollback Script`);
  console.log(`==============================`);

  if (isDryRun) {
    console.log(`🧪 Running in DRY RUN mode - no data will be deleted`);
  } else {
    console.log(`⚡ Running in LIVE mode - data WILL be deleted!`);
    validateEnvironment();
  }

  await runRollback(seedTag, isDryRun);
}

// ES Module entry point check
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { runRollback };