import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertJobSchema, 
  insertFreelancerProfileSchema, 
  insertApplicationSchema,
  insertMessageSchema,
  insertReviewSchema 
} from "@shared/schema";
import { calculateJobMatch, enhanceJobDescription, generateCoverLetter } from "./ai";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Jobs endpoints
  app.get("/api/jobs", async (req, res) => {
    try {
      const { category, skills, remote, featured, limit } = req.query;
      const skillsArray = skills ? (skills as string).split(",") : undefined;
      
      const jobs = await storage.getJobs({
        category: category as string,
        skills: skillsArray,
        remote: remote === "true",
        featured: featured === "true",
        limit: limit ? parseInt(limit as string) : 50
      });
      
      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const jobData = insertJobSchema.parse(req.body);
      
      // Enhance job description with AI
      const enhancedDescription = await enhanceJobDescription(
        jobData.title,
        jobData.description,
        jobData.skills || [],
        jobData.category
      );

      const job = await storage.createJob({
        ...jobData,
        description: enhancedDescription,
        employerId: req.user!.id
      });
      
      res.status(201).json(job);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/jobs/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const job = await storage.getJob(req.params.id);
      if (!job || job.employerId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updatedJob = await storage.updateJob(req.params.id, req.body);
      res.json(updatedJob);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/jobs/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const job = await storage.getJob(req.params.id);
      if (!job || job.employerId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      await storage.deleteJob(req.params.id);
      res.sendStatus(204);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Freelancer profiles endpoints
  app.get("/api/freelancers", async (req, res) => {
    try {
      const { skills, limit } = req.query;
      const skillsArray = skills ? (skills as string).split(",") : undefined;
      
      const freelancers = await storage.getFreelancers(
        limit ? parseInt(limit as string) : 50,
        skillsArray
      );
      
      res.json(freelancers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/freelancer-profile/:userId", async (req, res) => {
    try {
      const profile = await storage.getFreelancerProfile(req.params.userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/freelancer-profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const profileData = insertFreelancerProfileSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const profile = await storage.createFreelancerProfile(profileData);
      res.status(201).json(profile);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/freelancer-profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const profile = await storage.updateFreelancerProfile(req.user!.id, req.body);
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Applications endpoints
  app.get("/api/jobs/:jobId/applications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const job = await storage.getJob(req.params.jobId);
      if (!job || job.employerId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const applications = await storage.getApplicationsByJob(req.params.jobId);
      res.json(applications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/my-applications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const applications = await storage.getApplicationsByFreelancer(req.user!.id);
      res.json(applications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/applications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const applicationData = insertApplicationSchema.parse({
        ...req.body,
        freelancerId: req.user!.id
      });

      // Get job and freelancer details for AI matching
      const job = await storage.getJob(applicationData.jobId);
      const freelancerProfile = await storage.getFreelancerProfile(req.user!.id);

      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Calculate AI match score
      let aiMatchScore = 0;
      if (freelancerProfile) {
        const matchResult = await calculateJobMatch(
          job.skills || [],
          job.description,
          freelancerProfile.skills || [],
          freelancerProfile.experience || "",
          req.user!.bio || ""
        );
        aiMatchScore = matchResult.score;
      }

      const application = await storage.createApplication({
        ...applicationData,
        aiMatchScore: aiMatchScore.toString()
      });
      
      res.status(201).json(application);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/applications/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const application = await storage.getApplication(req.params.id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Check if user is the freelancer who applied or employer who owns the job
      const job = await storage.getJob(application.jobId);
      if (application.freelancerId !== req.user!.id && job?.employerId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updatedApplication = await storage.updateApplication(req.params.id, req.body);
      res.json(updatedApplication);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // AI endpoints
  app.post("/api/ai/generate-cover-letter", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { jobId } = req.body;
      const job = await storage.getJob(jobId);
      const freelancerProfile = await storage.getFreelancerProfile(req.user!.id);

      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      const coverLetter = await generateCoverLetter(
        job.title,
        job.description,
        freelancerProfile?.skills || [],
        freelancerProfile?.experience || ""
      );

      res.json({ coverLetter });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Messages endpoints
  app.get("/api/messages/:userId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { jobId } = req.query;
      const messages = await storage.getMessagesBetweenUsers(
        req.user!.id,
        req.params.userId,
        jobId as string
      );
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: req.user!.id
      });

      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/messages/mark-read/:senderId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      await storage.markMessagesAsRead(req.params.senderId, req.user!.id);
      res.sendStatus(200);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Reviews endpoints
  app.post("/api/reviews", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        reviewerId: req.user!.id
      });

      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/reviews/:userId", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByUser(req.params.userId);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Stripe payment endpoints
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
