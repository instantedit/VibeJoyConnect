import { 
  users, 
  freelancerProfiles, 
  jobs, 
  applications, 
  reviews, 
  messages,
  type User, 
  type InsertUser,
  type FreelancerProfile,
  type InsertFreelancerProfile,
  type Job,
  type InsertJob,
  type Application,
  type InsertApplication,
  type Review,
  type InsertReview,
  type Message,
  type InsertMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, ilike, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateStripeCustomerId(userId: string, customerId: string): Promise<User>;
  updateUserStripeInfo(userId: string, info: { customerId: string; subscriptionId: string }): Promise<User>;

  // Freelancer profile methods
  getFreelancerProfile(userId: string): Promise<FreelancerProfile | undefined>;
  createFreelancerProfile(profile: InsertFreelancerProfile): Promise<FreelancerProfile>;
  updateFreelancerProfile(userId: string, profile: Partial<InsertFreelancerProfile>): Promise<FreelancerProfile>;
  getFreelancers(limit?: number, skills?: string[]): Promise<(FreelancerProfile & { user: User })[]>;

  // Job methods
  getJob(id: string): Promise<Job | undefined>;
  getJobs(filters?: { category?: string; skills?: string[]; remote?: boolean; featured?: boolean; limit?: number }): Promise<(Job & { employer: User })[]>;
  getJobsByEmployer(employerId: string): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, job: Partial<InsertJob>): Promise<Job>;
  deleteJob(id: string): Promise<void>;

  // Application methods
  getApplication(id: string): Promise<Application | undefined>;
  getApplicationsByJob(jobId: string): Promise<(Application & { freelancer: User; freelancerProfile: FreelancerProfile })[]>;
  getApplicationsByFreelancer(freelancerId: string): Promise<(Application & { job: Job; employer: User })[]>;
  createApplication(application: InsertApplication, aiMatchScore?: number): Promise<Application>;
  updateApplication(id: string, application: Partial<InsertApplication>): Promise<Application>;

  // Review methods
  getReviewsByUser(userId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Message methods
  getMessagesBetweenUsers(user1Id: string, user2Id: string, jobId?: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(senderId: string, receiverId: string): Promise<void>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ pool, createTableIfMissing: true });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateStripeCustomerId(userId: string, customerId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, info: { customerId: string; subscriptionId: string }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeCustomerId: info.customerId,
        stripeSubscriptionId: info.subscriptionId 
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Freelancer profile methods
  async getFreelancerProfile(userId: string): Promise<FreelancerProfile | undefined> {
    const [profile] = await db
      .select()
      .from(freelancerProfiles)
      .where(eq(freelancerProfiles.userId, userId));
    return profile || undefined;
  }

  async createFreelancerProfile(profile: InsertFreelancerProfile): Promise<FreelancerProfile> {
    const [created] = await db
      .insert(freelancerProfiles)
      .values(profile)
      .returning();
    return created;
  }

  async updateFreelancerProfile(userId: string, profile: Partial<InsertFreelancerProfile>): Promise<FreelancerProfile> {
    const [updated] = await db
      .update(freelancerProfiles)
      .set(profile)
      .where(eq(freelancerProfiles.userId, userId))
      .returning();
    return updated;
  }

  async getFreelancers(limit = 50, skills?: string[]): Promise<(FreelancerProfile & { user: User })[]> {
    let query = db
      .select()
      .from(freelancerProfiles)
      .innerJoin(users, eq(freelancerProfiles.userId, users.id))
      .orderBy(desc(freelancerProfiles.rating), desc(freelancerProfiles.completedJobs))
      .limit(limit);

    if (skills && skills.length > 0) {
      query = query.where(
        sql`${freelancerProfiles.skills} @> ${JSON.stringify(skills)}`
      );
    }

    const results = await query;
    return results.map(result => ({
      ...result.freelancer_profiles,
      user: result.users
    }));
  }

  // Job methods
  async getJob(id: string): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job || undefined;
  }

  async getJobs(filters?: { 
    category?: string; 
    skills?: string[]; 
    remote?: boolean; 
    featured?: boolean; 
    limit?: number 
  }): Promise<(Job & { employer: User })[]> {
    let query = db
      .select()
      .from(jobs)
      .innerJoin(users, eq(jobs.employerId, users.id))
      .where(eq(jobs.status, "open"))
      .orderBy(desc(jobs.featured), desc(jobs.urgent), desc(jobs.createdAt))
      .limit(filters?.limit || 50);

    const conditions = [];

    if (filters?.category) {
      conditions.push(eq(jobs.category, filters.category));
    }

    if (filters?.remote !== undefined) {
      conditions.push(eq(jobs.remote, filters.remote));
    }

    if (filters?.featured) {
      conditions.push(eq(jobs.featured, true));
    }

    if (filters?.skills && filters.skills.length > 0) {
      conditions.push(
        sql`${jobs.skills} @> ${JSON.stringify(filters.skills)}`
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query;
    return results.map(result => ({
      ...result.jobs,
      employer: result.users
    }));
  }

  async getJobsByEmployer(employerId: string): Promise<Job[]> {
    return await db
      .select()
      .from(jobs)
      .where(eq(jobs.employerId, employerId))
      .orderBy(desc(jobs.createdAt));
  }

  async createJob(job: InsertJob): Promise<Job> {
    const [created] = await db.insert(jobs).values(job).returning();
    return created;
  }

  async updateJob(id: string, job: Partial<InsertJob>): Promise<Job> {
    const [updated] = await db
      .update(jobs)
      .set({ ...job, updatedAt: new Date() })
      .where(eq(jobs.id, id))
      .returning();
    return updated;
  }

  async deleteJob(id: string): Promise<void> {
    await db.delete(jobs).where(eq(jobs.id, id));
  }

  // Application methods
  async getApplication(id: string): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application || undefined;
  }

  async getApplicationsByJob(jobId: string): Promise<(Application & { freelancer: User; freelancerProfile: FreelancerProfile })[]> {
    const results = await db
      .select()
      .from(applications)
      .innerJoin(users, eq(applications.freelancerId, users.id))
      .innerJoin(freelancerProfiles, eq(users.id, freelancerProfiles.userId))
      .where(eq(applications.jobId, jobId))
      .orderBy(desc(applications.aiMatchScore), desc(applications.createdAt));

    return results.map(result => ({
      ...result.applications,
      freelancer: result.users,
      freelancerProfile: result.freelancer_profiles
    }));
  }

  async getApplicationsByFreelancer(freelancerId: string): Promise<(Application & { job: Job; employer: User })[]> {
    const results = await db
      .select()
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(users, eq(jobs.employerId, users.id))
      .where(eq(applications.freelancerId, freelancerId))
      .orderBy(desc(applications.createdAt));

    return results.map(result => ({
      ...result.applications,
      job: result.jobs,
      employer: result.users
    }));
  }

  async createApplication(application: InsertApplication, aiMatchScore?: number): Promise<Application> {
    const applicationData = aiMatchScore ? 
      { ...application, aiMatchScore: aiMatchScore.toString() } :
      application;
    const [created] = await db.insert(applications).values(applicationData).returning();
    
    // Update applications count
    await db
      .update(jobs)
      .set({ 
        applicationsCount: sql`${jobs.applicationsCount} + 1` 
      })
      .where(eq(jobs.id, application.jobId));

    return created;
  }

  async updateApplication(id: string, application: Partial<InsertApplication>): Promise<Application> {
    const [updated] = await db
      .update(applications)
      .set(application)
      .where(eq(applications.id, id))
      .returning();
    return updated;
  }

  // Review methods
  async getReviewsByUser(userId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.revieweeId, userId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [created] = await db.insert(reviews).values(review).returning();
    
    // Update freelancer rating
    const reviewee = await this.getUser(review.revieweeId);
    if (reviewee?.userType === 'freelancer') {
      const allReviews = await this.getReviewsByUser(review.revieweeId);
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      
      await db
        .update(freelancerProfiles)
        .set({ rating: avgRating.toFixed(2) })
        .where(eq(freelancerProfiles.userId, review.revieweeId));
    }

    return created;
  }

  // Message methods
  async getMessagesBetweenUsers(user1Id: string, user2Id: string, jobId?: string): Promise<Message[]> {
    const baseConditions = or(
      and(eq(messages.senderId, user1Id), eq(messages.receiverId, user2Id)),
      and(eq(messages.senderId, user2Id), eq(messages.receiverId, user1Id))
    );

    let query = db
      .select()
      .from(messages)
      .where(jobId ? and(baseConditions, eq(messages.jobId, jobId)) : baseConditions)
      .orderBy(asc(messages.createdAt));

    return await query;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [created] = await db.insert(messages).values(message).returning();
    return created;
  }

  async markMessagesAsRead(senderId: string, receiverId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.senderId, senderId),
          eq(messages.receiverId, receiverId),
          eq(messages.isRead, false)
        )
      );
  }
}

export const storage = new DatabaseStorage();
