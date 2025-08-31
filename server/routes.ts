import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertCreatorSchema, insertPostSchema, insertTipSchema, insertSubscriptionSchema, insertLikeSchema, insertConversationSchema, insertMessageSchema, insertCommentSchema, insertCommentVoteSchema, insertPostUnlockSchema, insertWalletNonceSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

// Helper function to check if user has access to a post
async function checkPostAccess(post: any, userId?: string): Promise<{
  hasAccess: boolean;
  reason?: string;
  isCreator: boolean;
}> {
  // Always accessible if public
  if (post.visibility === "public") {
    const creator = await storage.getCreatorByUserId(userId || "");
    return { hasAccess: true, isCreator: creator?.id === post.creatorId };
  }

  // Not authenticated users can't access private content
  if (!userId) {
    return { hasAccess: false, reason: "Authentication required", isCreator: false };
  }

  // Check if user is the creator of the post
  const creator = await storage.getCreatorByUserId(userId);
  const isCreator = creator?.id === post.creatorId;
  if (isCreator) {
    return { hasAccess: true, isCreator: true };
  }

  // Check member-only posts (requires active subscription)
  if (post.visibility === "members") {
    const subscriptions = await storage.getSubscriptionsBySupporter(userId);
    const activeSubscription = subscriptions.find(sub => 
      sub.creatorId === post.creatorId && 
      sub.active && 
      new Date(sub.endDate) > new Date()
    );
    
    if (activeSubscription) {
      return { hasAccess: true, isCreator: false };
    }
    return { hasAccess: false, reason: "Subscription required", isCreator: false };
  }

  // Check pay-per-view posts (requires unlock purchase)
  if (post.visibility === "ppv") {
    const unlock = await storage.getPostUnlock(post.id, userId);
    if (unlock) {
      return { hasAccess: true, isCreator: false };
    }
    return { hasAccess: false, reason: "Payment required", isCreator: false };
  }

  return { hasAccess: false, reason: "Unknown visibility type", isCreator: false };
}

// Helper function to filter post content based on access
function filterPostContent(post: any, hasAccess: boolean, isCreator: boolean) {
  if (hasAccess || isCreator) {
    return post;
  }

  // For locked posts, show limited preview
  return {
    ...post,
    content: post.content ? post.content.substring(0, 100) + "..." : null,
    mediaUrl: null, // Hide media for locked posts
    isLocked: true,
    unlockPrice: post.visibility === "ppv" ? post.price : null
  };
}

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Configure multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 25 * 1024 * 1024, // 25MB max file size
      files: 5, // Max 5 files
    },
    fileFilter: (req: any, file: any, cb: any) => {
      // Only allow image and video files
      if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image and video files are allowed'), false);
      }
    },
  });

  const objectStorageService = new ObjectStorageService();

  // Wallet verification endpoints
  app.get("/api/wallet/nonce", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      // Generate a random nonce
      const nonce = require('crypto').randomBytes(32).toString('hex');
      
      // Set expiration to 5 minutes from now
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      
      // Store nonce in database
      const nonceData = insertWalletNonceSchema.parse({
        userId: req.user!.id,
        nonce,
        expiresAt
      });
      
      await storage.createWalletNonce(nonceData);
      
      res.json({ nonce });
    } catch (error) {
      console.error('Error generating nonce:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/wallet/verify", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { address, signature, nonce } = req.body;
      
      if (!address || !signature || !nonce) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Verify nonce exists and is not expired
      const storedNonce = await storage.getWalletNonce(nonce, req.user!.id);
      if (!storedNonce) {
        return res.status(400).json({ message: "Invalid or expired nonce" });
      }

      if (storedNonce.used) {
        return res.status(400).json({ message: "Nonce already used" });
      }

      if (new Date() > new Date(storedNonce.expiresAt)) {
        return res.status(400).json({ message: "Nonce expired" });
      }

      // In a real implementation, you would verify the signature here
      // For MVP, we'll trust the client's signature (signature = transaction digest)
      
      // Mark nonce as used
      await storage.updateWalletNonce(storedNonce.id, { used: true });
      
      // Check if wallet address is already linked to another account
      const existingUser = await storage.getUserByWalletAddress(address);
      if (existingUser && existingUser.id !== req.user!.id) {
        return res.status(400).json({ message: "Wallet address already linked to another account" });
      }
      
      // Update user with verified wallet address
      await storage.updateUser(req.user!.id, {
        walletAddress: address,
        walletVerified: true
      });
      
      res.json({ 
        message: "Wallet verified successfully",
        walletAddress: address
      });
    } catch (error) {
      console.error('Error verifying wallet:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Creators
  app.get("/api/creators", async (req, res) => {
    const creators = await storage.getAllCreators();
    res.json(creators);
  });

  app.get("/api/creators/:handle", async (req, res) => {
    // Check if it's a UUID (ID) or handle
    const param = req.params.handle;
    const isId = param.length === 36 && param.includes('-'); // UUID format check
    
    let creator;
    if (isId) {
      creator = await storage.getCreator(param);
    } else {
      creator = await storage.getCreatorByHandle(param);
    }
    
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

  // Posts with proper visibility filtering
  app.get("/api/posts", async (req, res) => {
    const posts = await storage.getAllPosts();
    const userId = req.isAuthenticated() ? req.user!.id : undefined;
    
    // Filter posts based on user access and apply content filtering
    const filteredPosts = await Promise.all(
      posts.map(async (post) => {
        const { hasAccess, isCreator } = await checkPostAccess(post, userId);
        return filterPostContent(post, hasAccess, isCreator);
      })
    );
    
    res.json(filteredPosts);
  });

  app.get("/api/creators/:creatorId/posts", async (req, res) => {
    const posts = await storage.getPostsByCreator(req.params.creatorId);
    const userId = req.isAuthenticated() ? req.user!.id : undefined;
    
    // Filter posts based on user access and apply content filtering
    const filteredPosts = await Promise.all(
      posts.map(async (post) => {
        const { hasAccess, isCreator } = await checkPostAccess(post, userId);
        return filterPostContent(post, hasAccess, isCreator);
      })
    );
    
    res.json(filteredPosts);
  });

  // Multipart upload endpoint for posts with media
  app.post("/api/posts/upload", upload.array('media', 5), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const creator = await storage.getCreatorByUserId(req.user!.id);
    if (!creator) {
      return res.status(403).json({ message: "Creator profile required" });
    }

    try {
      const { content, visibility, price } = req.body;
      const files = req.files as any[];

      // Validate input
      if (!content?.trim() && (!files || files.length === 0)) {
        return res.status(400).json({ message: "Content or media files required" });
      }

      if (visibility === "ppv" && (!price || parseFloat(price) <= 0)) {
        return res.status(400).json({ message: "Valid price required for pay-per-view content" });
      }

      // Upload media files to object storage
      const mediaUrls: string[] = [];
      if (files && files.length > 0) {
        for (const file of files) {
          try {
            const mediaUrl = await objectStorageService.uploadFile(
              file.buffer,
              file.originalname,
              file.mimetype
            );
            mediaUrls.push(mediaUrl);
          } catch (uploadError) {
            console.error('Error uploading file:', uploadError);
            return res.status(500).json({ message: "Failed to upload media files" });
          }
        }
      }

      // Create post with media URLs
      const postData = insertPostSchema.parse({
        creatorId: creator.id,
        content: content?.trim() || "",
        mediaUrl: mediaUrls.length > 0 ? mediaUrls[0] : undefined, // For backwards compatibility
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
        visibility,
        price: visibility === "ppv" ? parseFloat(price) : undefined,
      });

      const post = await storage.createPost(postData);
      res.status(201).json(post);
    } catch (error) {
      console.error('Error creating post:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
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

  // Object serving endpoint
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(`/objects/${req.params.objectPath}`);
      await objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ error: "File not found" });
      }
      return res.status(500).json({ error: "Internal server error" });
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
      
      // Update creator earnings (only if creatorId is provided)
      if (tipData.creatorId) {
        const creator = await storage.getCreator(tipData.creatorId);
        if (creator) {
          await storage.updateCreator(tipData.creatorId, {
            totalEarnings: (creator.totalEarnings || 0) + tipData.amount,
          });
        }
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

  // Get user's subscriptions with expiration info
  app.get("/api/users/me/subscriptions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const subscriptions = await storage.getSubscriptionsBySupporter(req.user!.id);
    
    // Add creator info and remaining days to each subscription
    const subscriptionsWithDetails = await Promise.all(
      subscriptions.map(async (subscription) => {
        const creator = await storage.getCreator(subscription.creatorId);
        const now = new Date();
        const endDate = new Date(subscription.endDate);
        const remainingDays = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        const isExpired = endDate < now;
        
        return {
          ...subscription,
          creator: creator ? { id: creator.id, name: creator.name, handle: creator.handle, fandomName: creator.fandomName } : null,
          remainingDays,
          isExpired
        };
      })
    );
    
    res.json(subscriptionsWithDetails);
  });

  // Check subscription status for a specific creator
  app.get("/api/creators/:creatorId/subscription-status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const subscriptions = await storage.getSubscriptionsBySupporter(req.user!.id);
    const subscription = subscriptions.find(sub => 
      sub.creatorId === req.params.creatorId && sub.active
    );

    if (!subscription) {
      return res.json({ subscribed: false, remainingDays: 0 });
    }

    const now = new Date();
    const endDate = new Date(subscription.endDate);
    const remainingDays = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const isExpired = endDate < now;

    // Auto-expire if expired
    if (isExpired && subscription.active) {
      await storage.updateSubscription(subscription.id, { active: false });
    }

    const creator = await storage.getCreator(req.params.creatorId);

    res.json({
      subscribed: !isExpired,
      subscription: {
        ...subscription,
        remainingDays,
        isExpired
      },
      fandomBadge: creator?.fandomName || "Supporter"
    });
  });

  app.post("/api/subscriptions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      // Calculate end date (default 30 days from now)
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
      
      const subscriptionData = insertSubscriptionSchema.parse({
        ...req.body,
        supporterId: req.user!.id,
        startDate,
        endDate,
      });

      // Check for existing active subscription
      const existingSubscriptions = await storage.getSubscriptionsBySupporter(req.user!.id);
      const activeSubscription = existingSubscriptions.find(sub => 
        sub.creatorId === subscriptionData.creatorId && 
        sub.active && 
        new Date(sub.endDate) > new Date()
      );

      if (activeSubscription) {
        return res.status(400).json({ message: "Active subscription already exists" });
      }

      const subscription = await storage.createSubscription(subscriptionData);
      
      // Update creator earnings and subscriber count
      const creator = await storage.getCreator(subscriptionData.creatorId);
      if (creator) {
        await storage.updateCreator(subscriptionData.creatorId, {
          totalEarnings: (creator.totalEarnings || 0) + subscriptionData.amount,
          subscriberCount: (creator.subscriberCount || 0) + 1,
        });
      }

      // Calculate remaining days for response
      const now = new Date();
      const remainingDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      res.status(201).json({
        ...subscription,
        remainingDays,
        fandomBadge: creator?.fandomName || "Supporter"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Renew subscription
  app.patch("/api/subscriptions/:subscriptionId/renew", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const subscription = await storage.getSubscription(req.params.subscriptionId);
    if (!subscription || subscription.supporterId !== req.user!.id) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    try {
      const { duration = 30 } = req.body; // Default 30 days
      const newEndDate = new Date(Math.max(
        new Date().getTime(), // If subscription expired, start from now
        new Date(subscription.endDate).getTime() // If still active, extend from current end date
      ) + (duration * 24 * 60 * 60 * 1000));

      const renewedSubscription = await storage.updateSubscription(req.params.subscriptionId, {
        endDate: newEndDate,
        active: true
      });

      const now = new Date();
      const remainingDays = Math.ceil((newEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      res.json({
        ...renewedSubscription,
        remainingDays,
        message: "Subscription renewed successfully"
      });
    } catch (error) {
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

  // User profile updates
  app.patch("/api/user", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const updatedUser = await storage.updateUser(req.user!.id, req.body);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/user/password", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // In a real app, you'd verify the current password and hash the new one
    // For now, we'll just return success
    res.json({ message: "Password updated successfully" });
  });

  // User subscriptions
  app.get("/api/subscriptions/user", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const subscriptions = await storage.getSubscriptionsBySupporter(req.user!.id);
    res.json(subscriptions);
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

  // Help and contact endpoints
  app.post("/api/contact", async (req, res) => {
    // In a real app, this would send an email or create a support ticket
    // For now, just return success
    res.json({ message: "Contact message received" });
  });

  // Search functionality 
  app.get("/api/search", async (req, res) => {
    const { q, type } = req.query;
    const query = q as string;
    
    if (!query) {
      return res.json({ creators: [], posts: [] });
    }
    
    const creators = await storage.getAllCreators();
    const posts = await storage.getAllPosts();
    
    const filteredCreators = creators.filter(creator => 
      creator.name.toLowerCase().includes(query.toLowerCase()) ||
      creator.bio?.toLowerCase().includes(query.toLowerCase()) ||
      creator.category?.toLowerCase().includes(query.toLowerCase())
    );
    
    const filteredPosts = posts.filter(post =>
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.content?.toLowerCase().includes(query.toLowerCase())
    );
    
    res.json({
      creators: type === "posts" ? [] : filteredCreators,
      posts: type === "creators" ? [] : filteredPosts
    });
  });

  // Messaging - Get user's conversations
  app.get("/api/conversations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const conversations = await storage.getConversationsByUser(req.user!.id);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get messages in a conversation
  app.get("/api/conversations/:id/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const conversation = await storage.getConversation(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Check if user is part of this conversation
    if (conversation.user1Id !== req.user!.id && conversation.user2Id !== req.user!.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    try {
      const messages = await storage.getMessagesByConversation(req.params.id);
      // Mark messages as read
      await storage.markMessagesAsRead(req.params.id, req.user!.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Send a message
  app.post("/api/conversations/:id/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const conversation = await storage.getConversation(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Check if user is part of this conversation
    if (conversation.user1Id !== req.user!.id && conversation.user2Id !== req.user!.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        conversationId: req.params.id,
        senderId: req.user!.id,
      });

      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Start a new conversation
  app.post("/api/conversations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { otherUserId } = req.body;
      
      if (!otherUserId || otherUserId === req.user!.id) {
        return res.status(400).json({ message: "Invalid recipient" });
      }

      // Check if conversation already exists
      const existingConversation = await storage.getConversationByUsers(req.user!.id, otherUserId);
      if (existingConversation) {
        return res.json(existingConversation);
      }

      // Create new conversation
      const conversationData = insertConversationSchema.parse({
        user1Id: req.user!.id,
        user2Id: otherUserId,
      });

      const conversation = await storage.createConversation(conversationData);
      res.status(201).json(conversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Comments API
  app.get("/api/posts/:postId/comments", async (req, res) => {
    const comments = await storage.getCommentsByPost(req.params.postId);
    
    // Get user info for each comment
    const commentsWithUsers = await Promise.all(
      comments.map(async (comment) => {
        const user = await storage.getUser(comment.userId);
        return {
          ...comment,
          user: user ? { id: user.id, displayName: user.displayName } : null
        };
      })
    );
    
    res.json(commentsWithUsers);
  });

  app.post("/api/posts/:postId/comments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const commentData = insertCommentSchema.parse({
        ...req.body,
        postId: req.params.postId,
        userId: req.user!.id,
      });

      const comment = await storage.createComment(commentData);
      
      // Get user info for response
      const user = await storage.getUser(req.user!.id);
      const commentWithUser = {
        ...comment,
        user: user ? { id: user.id, displayName: user.displayName } : null
      };
      
      res.status(201).json(commentWithUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/comments/:commentId/hide", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const comment = await storage.getComment(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Get the post to check if user is the creator
    const post = await storage.getPost(comment.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const creator = await storage.getCreatorByUserId(req.user!.id);
    if (!creator || post.creatorId !== creator.id) {
      return res.status(403).json({ message: "Only post creators can hide comments" });
    }

    const updatedComment = await storage.updateComment(req.params.commentId, {
      isHidden: req.body.isHidden ?? true
    });

    res.json(updatedComment);
  });

  app.delete("/api/comments/:commentId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const comment = await storage.getComment(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Only comment owner can delete
    if (comment.userId !== req.user!.id) {
      return res.status(403).json({ message: "Can only delete your own comments" });
    }

    const deleted = await storage.deleteComment(req.params.commentId);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  app.patch("/api/comments/:commentId/vote", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { voteType } = req.body; // "upvote" | "downvote"
    if (!voteType || !['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ message: "Invalid vote type" });
    }

    const comment = await storage.getComment(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    try {
      // Check if user already voted
      const existingVote = await storage.getCommentVote(req.params.commentId, req.user!.id);
      
      if (existingVote) {
        if (existingVote.voteType === voteType) {
          // Remove vote if same type
          await storage.deleteCommentVote(req.params.commentId, req.user!.id);
          res.json({ message: "Vote removed" });
        } else {
          // Update vote if different type
          await storage.deleteCommentVote(req.params.commentId, req.user!.id);
          const voteData = insertCommentVoteSchema.parse({
            commentId: req.params.commentId,
            userId: req.user!.id,
            voteType
          });
          await storage.createCommentVote(voteData);
          res.json({ message: "Vote updated" });
        }
      } else {
        // Create new vote
        const voteData = insertCommentVoteSchema.parse({
          commentId: req.params.commentId,
          userId: req.user!.id,
          voteType
        });
        await storage.createCommentVote(voteData);
        res.json({ message: "Vote added" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Fandom Badge System
  app.get("/api/users/me/badges", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const subscriptions = await storage.getSubscriptionsBySupporter(req.user!.id);
    
    // Get all fandom badges from active subscriptions
    const badges = await Promise.all(
      subscriptions
        .filter(sub => sub.active && new Date(sub.endDate) > new Date())
        .map(async (subscription) => {
          const creator = await storage.getCreator(subscription.creatorId);
          if (!creator || !creator.fandomName) return null;
          
          return {
            fandomName: creator.fandomName,
            creatorName: creator.name,
            creatorHandle: creator.handle,
            earnedAt: subscription.startDate,
            tier: subscription.tier || "Basic"
          };
        })
    );

    const validBadges = badges.filter(badge => badge !== null);
    res.json(validBadges);
  });

  app.patch("/api/creators/:creatorId/fandom", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const creator = await storage.getCreator(req.params.creatorId);
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    // Check if user owns this creator profile
    const userCreator = await storage.getCreatorByUserId(req.user!.id);
    if (!userCreator || userCreator.id !== req.params.creatorId) {
      return res.status(403).json({ message: "Can only update your own creator profile" });
    }

    try {
      const { fandomName } = req.body;
      if (typeof fandomName !== "string" || fandomName.length > 50) {
        return res.status(400).json({ message: "Invalid fandom name" });
      }

      const updatedCreator = await storage.updateCreator(req.params.creatorId, {
        fandomName: fandomName || null
      });

      res.json({
        ...updatedCreator,
        message: "Fandom name updated successfully"
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Enhanced subscription tiers
  app.get("/api/creators/:creatorId/subscription-tiers", async (req, res) => {
    const creator = await storage.getCreator(req.params.creatorId);
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    // Default tier structure - creators can customize this later
    const tiers = [
      {
        name: "Basic",
        price: 5,
        description: `Join ${creator.name}'s community and get access to exclusive content.`,
        benefits: ["Exclusive posts", "Community access", creator.fandomName ? `${creator.fandomName} badge` : "Supporter badge"]
      },
      {
        name: "Premium", 
        price: 15,
        description: `Show extra support for ${creator.name} with premium benefits.`,
        benefits: ["All Basic benefits", "Early access to content", "Direct messaging", "Premium badge"]
      },
      {
        name: "VIP",
        price: 30,
        description: `Become a VIP supporter of ${creator.name}.`,
        benefits: ["All Premium benefits", "Monthly video calls", "Behind-the-scenes content", "VIP badge"]
      }
    ];

    res.json(tiers);
  });

  // Tip-to-unlock functionality
  app.post("/api/posts/:postId/unlock", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const post = await storage.getPost(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.visibility !== "ppv") {
      return res.status(400).json({ message: "Post is not pay-per-view" });
    }

    // Check if already unlocked
    const existingUnlock = await storage.getPostUnlock(req.params.postId, req.user!.id);
    if (existingUnlock) {
      return res.status(400).json({ message: "Post already unlocked" });
    }

    try {
      // Create tip for unlock
      const tipData = insertTipSchema.parse({
        supporterId: req.user!.id,
        postId: req.params.postId,
        amount: post.price || 0,
        message: "Tip-to-unlock purchase"
      });

      const tip = await storage.createTip(tipData);

      // Create unlock record
      const unlockData = insertPostUnlockSchema.parse({
        postId: req.params.postId,
        userId: req.user!.id,
        tipId: tip.id
      });

      const unlock = await storage.createPostUnlock(unlockData);

      // Update creator earnings if post has creator
      if (post.creatorId) {
        const creator = await storage.getCreator(post.creatorId);
        if (creator) {
          await storage.updateCreator(post.creatorId, {
            totalEarnings: (creator.totalEarnings || 0) + (post.price || 0)
          });
        }
      }

      res.status(201).json({ unlock, tip, message: "Post unlocked successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
