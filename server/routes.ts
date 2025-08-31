import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertCreatorSchema, insertPostSchema, insertTipSchema, insertSubscriptionSchema, insertLikeSchema } from "@shared/schema";
import { z } from "zod";

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Creators
  app.get("/api/creators", async (req, res) => {
    const creators = await storage.getAllCreators();
    res.json(creators);
  });

  app.get("/api/creators/:handle", async (req, res) => {
    const creator = await storage.getCreatorByHandle(req.params.handle);
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }
    res.json(creator);
  });

  app.post("/api/creators", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const creatorData = insertCreatorSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });

      // Check if user already has a creator profile
      const existingCreator = await storage.getCreatorByUserId(req.user!.id);
      if (existingCreator) {
        return res.status(400).json({ message: "Creator profile already exists" });
      }

      // Check if handle is available
      const handleExists = await storage.getCreatorByHandle(creatorData.handle);
      if (handleExists) {
        return res.status(400).json({ message: "Handle already taken" });
      }

      const creator = await storage.createCreator(creatorData);
      
      // Update user role to creator
      await storage.updateUser(req.user!.id, { role: "creator" });
      
      res.status(201).json(creator);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/creators/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const creator = await storage.getCreator(req.params.id);
    if (!creator || creator.userId !== req.user!.id) {
      return res.status(404).json({ message: "Creator not found" });
    }

    try {
      const updatedCreator = await storage.updateCreator(req.params.id, req.body);
      res.json(updatedCreator);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Posts
  app.get("/api/posts", async (req, res) => {
    const posts = await storage.getAllPosts();
    res.json(posts);
  });

  app.get("/api/creators/:creatorId/posts", async (req, res) => {
    const posts = await storage.getPostsByCreator(req.params.creatorId);
    res.json(posts);
  });

  app.post("/api/posts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const creator = await storage.getCreatorByUserId(req.user!.id);
    if (!creator) {
      return res.status(403).json({ message: "Creator profile required" });
    }

    try {
      const postData = insertPostSchema.parse({
        ...req.body,
        creatorId: creator.id,
      });

      const post = await storage.createPost(postData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/posts/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const post = await storage.getPost(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const creator = await storage.getCreator(post.creatorId);
    if (!creator || creator.userId !== req.user!.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    try {
      const updatedPost = await storage.updatePost(req.params.id, req.body);
      res.json(updatedPost);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/posts/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const post = await storage.getPost(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const creator = await storage.getCreator(post.creatorId);
    if (!creator || creator.userId !== req.user!.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const deleted = await storage.deletePost(req.params.id);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Tips
  app.get("/api/creators/:creatorId/tips", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const creator = await storage.getCreator(req.params.creatorId);
    if (!creator || creator.userId !== req.user!.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const tips = await storage.getTipsByCreator(req.params.creatorId);
    res.json(tips);
  });

  app.post("/api/tips", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const tipData = insertTipSchema.parse({
        ...req.body,
        supporterId: req.user!.id,
      });

      const tip = await storage.createTip(tipData);
      
      // Update creator earnings
      const creator = await storage.getCreator(tipData.creatorId);
      if (creator) {
        await storage.updateCreator(tipData.creatorId, {
          totalEarnings: (creator.totalEarnings || 0) + tipData.amount,
        });
      }

      res.status(201).json(tip);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Subscriptions
  app.get("/api/creators/:creatorId/subscriptions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const creator = await storage.getCreator(req.params.creatorId);
    if (!creator || creator.userId !== req.user!.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const subscriptions = await storage.getSubscriptionsByCreator(req.params.creatorId);
    res.json(subscriptions);
  });

  app.post("/api/subscriptions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const subscriptionData = insertSubscriptionSchema.parse({
        ...req.body,
        supporterId: req.user!.id,
      });

      const subscription = await storage.createSubscription(subscriptionData);
      
      // Update creator earnings and subscriber count
      const creator = await storage.getCreator(subscriptionData.creatorId);
      if (creator) {
        await storage.updateCreator(subscriptionData.creatorId, {
          totalEarnings: (creator.totalEarnings || 0) + subscriptionData.amount,
          subscriberCount: (creator.subscriberCount || 0) + 1,
        });
      }

      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Likes
  app.post("/api/likes", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const likeData = insertLikeSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });

      // Check if already liked
      const existingLike = await storage.getLike(req.user!.id, likeData.postId);
      if (existingLike) {
        return res.status(400).json({ message: "Already liked" });
      }

      const like = await storage.createLike(likeData);
      
      // Update post like count
      const post = await storage.getPost(likeData.postId);
      if (post) {
        await storage.updatePost(likeData.postId, {
          likes: (post.likes || 0) + 1,
        });
      }

      res.status(201).json(like);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/likes/:postId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const deleted = await storage.deleteLike(req.user!.id, req.params.postId);
    if (deleted) {
      // Update post like count
      const post = await storage.getPost(req.params.postId);
      if (post) {
        await storage.updatePost(req.params.postId, {
          likes: Math.max((post.likes || 0) - 1, 0),
        });
      }
      res.status(204).send();
    } else {
      res.status(404).json({ message: "Like not found" });
    }
  });

  // Analytics
  app.get("/api/creators/:creatorId/analytics", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const creator = await storage.getCreator(req.params.creatorId);
    if (!creator || creator.userId !== req.user!.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const tips = await storage.getTipsByCreator(req.params.creatorId);
    const subscriptions = await storage.getSubscriptionsByCreator(req.params.creatorId);
    const posts = await storage.getPostsByCreator(req.params.creatorId);

    // Calculate analytics
    const totalRevenue = creator.totalEarnings || 0;
    const monthlyRevenue = subscriptions.reduce((sum, sub) => sum + (sub.active ? sub.amount : 0), 0);
    const recentTips = tips.filter(tip => 
      new Date(tip.createdAt!).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    );
    const totalTips = recentTips.reduce((sum, tip) => sum + tip.amount, 0);
    const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);

    res.json({
      totalRevenue,
      monthlyRevenue,
      subscriberCount: creator.subscriberCount || 0,
      recentTips: totalTips,
      totalPosts: posts.length,
      totalLikes,
      tips: tips.slice(0, 10), // Recent tips
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
