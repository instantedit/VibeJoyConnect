import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import { 
  users, 
  freelancerProfiles, 
  jobs, 
  applications, 
  reviews, 
  messages,
  type InsertUser,
  type InsertFreelancerProfile,
  type InsertJob,
  type InsertApplication,
  type InsertReview,
  type InsertMessage
} from "../../shared/schema.js";
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";
import { eq, and, inArray } from "drizzle-orm";
import fs from "fs";
import path from "path";

const scryptAsync = promisify(scrypt);

neonConfig.webSocketConstructor = ws;

// ============= PASSWORD UTILITIES =============
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

function generateSecurePassword(): string {
  // Generate a random 16-character password with mixed case, numbers, and symbols
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// ============= SAFETY CONFIGURATION =============
const SEED_TAG = "prod-seed-2025";
const REQUIRED_ENV_VAR = "ALLOW_PROD_SEED";
const CONFIRM_VAR = "CONFIRM_SEED_TAG";
const SEEDS_LOG_FILE = path.join(process.cwd(), `seeds-${SEED_TAG}.json`);

// Environment validation
function validateEnvironment() {
  if (process.env.NODE_ENV !== "production") {
    console.error("❌ This script is only for production environment");
    console.error(`Current NODE_ENV: ${process.env.NODE_ENV}`);
    process.exit(1);
  }

  if (!process.env[REQUIRED_ENV_VAR] || process.env[REQUIRED_ENV_VAR] !== "true") {
    console.error(`❌ Missing required environment variable: ${REQUIRED_ENV_VAR}=true`);
    console.error("This is a safety measure to prevent accidental execution");
    process.exit(1);
  }

  if (!process.env[CONFIRM_VAR] || process.env[CONFIRM_VAR] !== SEED_TAG) {
    console.error(`❌ Invalid seed tag confirmation`);
    console.error(`Expected: ${CONFIRM_VAR}=${SEED_TAG}`);
    console.error(`Got: ${CONFIRM_VAR}=${process.env[CONFIRM_VAR]}`);
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

// ============= SEED DATA GENERATORS =============
async function generateUsers(): Promise<InsertUser[]> {
  const users: InsertUser[] = [];
  
  console.log(`🔐 Generating secure passwords for test accounts...`);
  
  // Generate 5 employers
  for (let i = 1; i <= 5; i++) {
    const password = generateSecurePassword();
    const hashedPassword = await hashPassword(password);
    
    users.push({
      username: `${SEED_TAG}_employer_${i}`,
      email: `${SEED_TAG}_employer_${i}@example.com`,
      password: hashedPassword,
      userType: "employer",
      firstName: `Employer`,
      lastName: `${i}`,
      bio: `[SEED ACCOUNT] Employer ${i} - Test account for platform demonstration. Password: ${password}`,
      location: `City ${i}, Country`,
      website: `https://company${i}.example.com`
      // Note: Stripe fields omitted from insert schema to avoid payment issues
    });
  }

  // Generate 10 freelancers
  for (let i = 1; i <= 10; i++) {
    const password = generateSecurePassword();
    const hashedPassword = await hashPassword(password);
    
    users.push({
      username: `${SEED_TAG}_freelancer_${i}`,
      email: `${SEED_TAG}_freelancer_${i}@example.com`,
      password: hashedPassword,
      userType: "freelancer",
      firstName: `Freelancer`,
      lastName: `${i}`,
      bio: `[SEED ACCOUNT] Freelancer ${i} - Test account for platform demonstration. Password: ${password}`,
      location: `City ${i + 5}, Country`,
      website: `https://portfolio${i}.example.com`
      // Note: Stripe fields omitted from insert schema to avoid payment issues
    });
  }

  console.log(`✅ Generated ${users.length} users with secure passwords`);
  return users;
}

function generateFreelancerProfiles(userIds: string[]): InsertFreelancerProfile[] {
  const freelancerIds = userIds.slice(5, 15); // Last 10 users are freelancers
  
  return freelancerIds.map((userId, index) => ({
    userId,
    title: `${SEED_TAG} - Professional Developer ${index + 1}`,
    hourlyRate: `${(25 + index * 10)}.00`,
    skills: [`JavaScript`, `TypeScript`, `React`, `Node.js`].slice(0, 2 + index % 3),
    experience: `3+ years of experience in ${SEED_TAG} development`,
    portfolio: [
      {
        title: `${SEED_TAG} Project ${index + 1}`,
        url: `https://demo-project-${index + 1}.example.com`,
        description: `Seed portfolio project ${index + 1} for testing`
      }
    ],
    availability: "available"
  }));
}

function generateJobs(employerIds: string[]): InsertJob[] {
  const categories = ['Web Development', 'Mobile App', 'Design', 'Data Science', 'Marketing'];
  const experiences = ['entry', 'intermediate', 'expert'] as const;
  
  return Array.from({ length: 10 }, (_, index) => ({
    employerId: employerIds[index % employerIds.length],
    title: `${SEED_TAG} - Job Posting ${index + 1}`,
    description: `This is a seed job posting ${index + 1} for testing the platform. It includes all necessary details for demonstration purposes.`,
    budget: `${(500 + index * 200)}.00`,
    budgetType: index % 2 === 0 ? 'fixed' : 'hourly' as 'fixed' | 'hourly',
    skills: [`JavaScript`, `TypeScript`, `React`, `Python`].slice(0, 2 + index % 3),
    category: categories[index % categories.length],
    experience: experiences[index % experiences.length],
    duration: `${2 + index % 6} weeks`,
    remote: index % 3 !== 0,
    location: index % 3 === 0 ? `City ${index + 1}, Country` : null,
    status: 'open'
  }));
}

function generateApplications(jobIds: string[], freelancerIds: string[]): InsertApplication[] {
  return Array.from({ length: 10 }, (_, index) => ({
    jobId: jobIds[index % jobIds.length],
    freelancerId: freelancerIds[index % freelancerIds.length],
    coverLetter: `${SEED_TAG} - Application ${index + 1}: This is a seed cover letter for testing purposes. The freelancer is interested in this project and has relevant experience.`,
    proposedRate: `${(20 + index * 5)}.00`,
    proposedDuration: `${1 + index % 8} weeks`,
    status: 'pending'
  }));
}

function generateReviews(jobIds: string[], userIds: string[]): InsertReview[] {
  return Array.from({ length: 10 }, (_, index) => ({
    jobId: jobIds[index % jobIds.length],
    reviewerId: userIds[index % userIds.length],
    revieweeId: userIds[(index + 1) % userIds.length],
    rating: 3 + (index % 3), // Rating 3-5
    comment: `${SEED_TAG} - Review ${index + 1}: This is a seed review for testing purposes. The work was completed satisfactorily.`
  }));
}

function generateMessages(userIds: string[], jobIds: string[]): InsertMessage[] {
  return Array.from({ length: 10 }, (_, index) => ({
    senderId: userIds[index % userIds.length],
    receiverId: userIds[(index + 1) % userIds.length],
    jobId: index < 5 ? jobIds[index] : null,
    content: `${SEED_TAG} - Message ${index + 1}: This is a seed message for testing the messaging system.`,
    isRead: index % 3 === 0
  }));
}

// ============= IDEMPOTENCY CHECKS =============
function checkForExistingSeeds(): { hasSeeds: boolean; existingFile?: string } {
  if (fs.existsSync(SEEDS_LOG_FILE)) {
    return { hasSeeds: true, existingFile: SEEDS_LOG_FILE };
  }
  
  // Also check for any other seed log files with different tags
  const currentDir = process.cwd();
  const files = fs.readdirSync(currentDir);
  const seedLogFiles = files.filter(f => f.startsWith('seeds-') && f.endsWith('.json'));
  
  if (seedLogFiles.length > 0) {
    return { hasSeeds: true, existingFile: seedLogFiles[0] };
  }
  
  return { hasSeeds: false };
}

// ============= SEEDING FUNCTIONS =============
async function seedTable<T>(tableName: string, table: any, data: T[], isDryRun: boolean, tx?: any): Promise<string[]> {
  console.log(`\n📋 ${tableName}: ${isDryRun ? 'DRY RUN' : 'SEEDING'} ${data.length} records...`);
  
  if (isDryRun) {
    console.log(`  ✅ Would insert ${data.length} ${tableName} records`);
    return data.map((_, index) => `fake-id-${index}`);
  }

  try {
    const dbInstance = tx || db;
    const result = await dbInstance.insert(table).values(data).returning({ id: table.id });
    const ids = result.map(r => r.id);
    console.log(`  ✅ Inserted ${ids.length} ${tableName} records`);
    return ids;
  } catch (error) {
    console.error(`  ❌ Failed to seed ${tableName}:`, error);
    throw error;
  }
}

async function saveSeedsLog(seedIds: Record<string, string[]>) {
  const logData = {
    tag: SEED_TAG,
    timestamp: new Date().toISOString(),
    seedIds,
    counts: Object.entries(seedIds).reduce((acc, [table, ids]) => {
      acc[table] = ids.length;
      return acc;
    }, {} as Record<string, number>)
  };

  fs.writeFileSync(SEEDS_LOG_FILE, JSON.stringify(logData, null, 2));
  console.log(`\n📄 Seed log saved to: ${SEEDS_LOG_FILE}`);
}

// ============= MAIN EXECUTION =============
async function runSeed(isDryRun: boolean) {
  console.log(`\n🚀 Starting production seed ${isDryRun ? '(DRY RUN)' : ''}`);
  console.log(`📦 Seed tag: ${SEED_TAG}`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV}`);
  
  // Check for existing seeds to prevent duplicates
  const existingCheck = checkForExistingSeeds();
  if (existingCheck.hasSeeds && !isDryRun) {
    console.error(`\n❌ Seeding already completed!`);
    console.error(`🗃️  Existing seed log found: ${existingCheck.existingFile}`);
    console.error(`🔄 To re-seed, first run rollback: npm run rollback-seed`);
    console.error(`⚠️  Or use --dry-run to test without affecting the database`);
    process.exit(1);
  } else if (existingCheck.hasSeeds && isDryRun) {
    console.log(`\n📄 Note: Existing seed log found: ${existingCheck.existingFile}`);
    console.log(`🧪 Continuing with dry run...`);
  }
  
  if (!isDryRun) {
    console.log(`\n⚠️  WARNING: This will INSERT data into PRODUCTION database!`);
    console.log(`⚠️  All records will be tagged with: ${SEED_TAG}`);
    console.log(`⚠️  Stripe fields will be kept NULL to avoid charges`);
  }

  const seedIds: Record<string, string[]> = {};

  try {
    if (isDryRun) {
      // For dry run, execute without transaction
      const usersData = await generateUsers();
      const userIds = await seedTable('users', users, usersData, isDryRun);
      seedIds.users = userIds;

      const freelancerIds = userIds.slice(5, 15);
      const freelancerProfilesData = generateFreelancerProfiles(userIds);
      const profileIds = await seedTable('freelancer_profiles', freelancerProfiles, freelancerProfilesData, isDryRun);
      seedIds.freelancer_profiles = profileIds;

      const employerIds = userIds.slice(0, 5);
      const jobsData = generateJobs(employerIds);
      const jobIds = await seedTable('jobs', jobs, jobsData, isDryRun);
      seedIds.jobs = jobIds;

      const applicationsData = generateApplications(jobIds, freelancerIds);
      const applicationIds = await seedTable('applications', applications, applicationsData, isDryRun);
      seedIds.applications = applicationIds;

      const reviewsData = generateReviews(jobIds, userIds);
      const reviewIds = await seedTable('reviews', reviews, reviewsData, isDryRun);
      seedIds.reviews = reviewIds;

      const messagesData = generateMessages(userIds, jobIds);
      const messageIds = await seedTable('messages', messages, messagesData, isDryRun);
      seedIds.messages = messageIds;
    } else {
      // For live mode, wrap everything in a transaction
      console.log(`\n🔒 Starting atomic transaction...`);
      
      await db.transaction(async (tx) => {
        // 1. Seed Users (5 employers + 10 freelancers)
        const usersData = await generateUsers();
        const userIds = await seedTable('users', users, usersData, isDryRun, tx);
        seedIds.users = userIds;

        // 2. Seed Freelancer Profiles (for 10 freelancers)
        const freelancerIds = userIds.slice(5, 15);
        const freelancerProfilesData = generateFreelancerProfiles(userIds);
        const profileIds = await seedTable('freelancer_profiles', freelancerProfiles, freelancerProfilesData, isDryRun, tx);
        seedIds.freelancer_profiles = profileIds;

        // 3. Seed Jobs (10 jobs from employers)
        const employerIds = userIds.slice(0, 5);
        const jobsData = generateJobs(employerIds);
        const jobIds = await seedTable('jobs', jobs, jobsData, isDryRun, tx);
        seedIds.jobs = jobIds;

        // 4. Seed Applications (10 applications)
        const applicationsData = generateApplications(jobIds, freelancerIds);
        const applicationIds = await seedTable('applications', applications, applicationsData, isDryRun, tx);
        seedIds.applications = applicationIds;

        // 5. Seed Reviews (10 reviews)
        const reviewsData = generateReviews(jobIds, userIds);
        const reviewIds = await seedTable('reviews', reviews, reviewsData, isDryRun, tx);
        seedIds.reviews = reviewIds;

        // 6. Seed Messages (10 messages)
        const messagesData = generateMessages(userIds, jobIds);
        const messageIds = await seedTable('messages', messages, messagesData, isDryRun, tx);
        seedIds.messages = messageIds;

        console.log(`\n✅ Transaction completed successfully`);
      });

      // Save seed log for rollback (outside transaction to avoid rollback of log file)
      await saveSeedsLog(seedIds);
    }

    console.log(`\n✅ Seed completed successfully!`);
    console.log(`📊 Summary:`);
    Object.entries(seedIds).forEach(([table, ids]) => {
      console.log(`  - ${table}: ${ids.length} records`);
    });

    if (!isDryRun) {
      console.log(`\n🔄 To rollback, run:`);
      console.log(`npm run rollback-seed`);
    }

  } catch (error) {
    console.error(`\n❌ Seed failed:`, error);
    throw error;
  } finally {
    await pool.end();
  }
}

// ============= CLI HANDLING =============
async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');

  console.log(`\n🔐 Production Seed Script`);
  console.log(`==========================`);

  if (isDryRun) {
    console.log(`🧪 Running in DRY RUN mode - no data will be inserted`);
  } else {
    console.log(`⚡ Running in LIVE mode - data WILL be inserted!`);
    validateEnvironment();
  }

  await runSeed(isDryRun);
}

// ES Module entry point check
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { runSeed, SEED_TAG, SEEDS_LOG_FILE };