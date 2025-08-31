import { type User, type InsertUser, type Creator, type InsertCreator, type Post, type InsertPost, type Subscription, type InsertSubscription, type Tip, type InsertTip, type Like, type InsertLike } from "@shared/schema";
import { randomUUID } from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;

  // Creators
  getCreator(id: string): Promise<Creator | undefined>;
  getCreatorByUserId(userId: string): Promise<Creator | undefined>;
  getCreatorByHandle(handle: string): Promise<Creator | undefined>;
  getAllCreators(): Promise<Creator[]>;
  createCreator(creator: InsertCreator): Promise<Creator>;
  updateCreator(id: string, creator: Partial<Creator>): Promise<Creator | undefined>;

  // Posts
  getPost(id: string): Promise<Post | undefined>;
  getPostsByCreator(creatorId: string): Promise<Post[]>;
  getAllPosts(): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, post: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: string): Promise<boolean>;

  // Subscriptions
  getSubscription(id: string): Promise<Subscription | undefined>;
  getSubscriptionsBySupporter(supporterId: string): Promise<Subscription[]>;
  getSubscriptionsByCreator(creatorId: string): Promise<Subscription[]>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, subscription: Partial<Subscription>): Promise<Subscription | undefined>;

  // Tips
  getTip(id: string): Promise<Tip | undefined>;
  getTipsBySupporter(supporterId: string): Promise<Tip[]>;
  getTipsByCreator(creatorId: string): Promise<Tip[]>;
  createTip(tip: InsertTip): Promise<Tip>;

  // Likes
  getLike(userId: string, postId: string): Promise<Like | undefined>;
  getLikesByPost(postId: string): Promise<Like[]>;
  createLike(like: InsertLike): Promise<Like>;
  deleteLike(userId: string, postId: string): Promise<boolean>;

  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private creators: Map<string, Creator>;
  private posts: Map<string, Post>;
  private subscriptions: Map<string, Subscription>;
  private tips: Map<string, Tip>;
  private likes: Map<string, Like>;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.creators = new Map();
    this.posts = new Map();
    this.subscriptions = new Map();
    this.tips = new Map();
    this.likes = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, userUpdate: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...userUpdate };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Creators
  async getCreator(id: string): Promise<Creator | undefined> {
    return this.creators.get(id);
  }

  async getCreatorByUserId(userId: string): Promise<Creator | undefined> {
    return Array.from(this.creators.values()).find(creator => creator.userId === userId);
  }

  async getCreatorByHandle(handle: string): Promise<Creator | undefined> {
    return Array.from(this.creators.values()).find(creator => creator.handle === handle);
  }

  async getAllCreators(): Promise<Creator[]> {
    return Array.from(this.creators.values());
  }

  async createCreator(insertCreator: InsertCreator): Promise<Creator> {
    const id = randomUUID();
    const creator: Creator = { 
      ...insertCreator, 
      id, 
      createdAt: new Date() 
    };
    this.creators.set(id, creator);
    return creator;
  }

  async updateCreator(id: string, creatorUpdate: Partial<Creator>): Promise<Creator | undefined> {
    const creator = this.creators.get(id);
    if (!creator) return undefined;
    const updatedCreator = { ...creator, ...creatorUpdate };
    this.creators.set(id, updatedCreator);
    return updatedCreator;
  }

  // Posts
  async getPost(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getPostsByCreator(creatorId: string): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.creatorId === creatorId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getAllPosts(): Promise<Post[]> {
    return Array.from(this.posts.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = randomUUID();
    const post: Post = { 
      ...insertPost, 
      id, 
      createdAt: new Date() 
    };
    this.posts.set(id, post);
    return post;
  }

  async updatePost(id: string, postUpdate: Partial<Post>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    const updatedPost = { ...post, ...postUpdate };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: string): Promise<boolean> {
    return this.posts.delete(id);
  }

  // Subscriptions
  async getSubscription(id: string): Promise<Subscription | undefined> {
    return this.subscriptions.get(id);
  }

  async getSubscriptionsBySupporter(supporterId: string): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values()).filter(sub => sub.supporterId === supporterId);
  }

  async getSubscriptionsByCreator(creatorId: string): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values()).filter(sub => sub.creatorId === creatorId);
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = randomUUID();
    const subscription: Subscription = { 
      ...insertSubscription, 
      id, 
      createdAt: new Date() 
    };
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async updateSubscription(id: string, subUpdate: Partial<Subscription>): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return undefined;
    const updatedSubscription = { ...subscription, ...subUpdate };
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }

  // Tips
  async getTip(id: string): Promise<Tip | undefined> {
    return this.tips.get(id);
  }

  async getTipsBySupporter(supporterId: string): Promise<Tip[]> {
    return Array.from(this.tips.values()).filter(tip => tip.supporterId === supporterId);
  }

  async getTipsByCreator(creatorId: string): Promise<Tip[]> {
    return Array.from(this.tips.values())
      .filter(tip => tip.creatorId === creatorId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createTip(insertTip: InsertTip): Promise<Tip> {
    const id = randomUUID();
    const tip: Tip = { 
      ...insertTip, 
      id, 
      createdAt: new Date() 
    };
    this.tips.set(id, tip);
    return tip;
  }

  // Likes
  async getLike(userId: string, postId: string): Promise<Like | undefined> {
    return Array.from(this.likes.values()).find(like => like.userId === userId && like.postId === postId);
  }

  async getLikesByPost(postId: string): Promise<Like[]> {
    return Array.from(this.likes.values()).filter(like => like.postId === postId);
  }

  async createLike(insertLike: InsertLike): Promise<Like> {
    const id = randomUUID();
    const like: Like = { 
      ...insertLike, 
      id, 
      createdAt: new Date() 
    };
    this.likes.set(id, like);
    return like;
  }

  async deleteLike(userId: string, postId: string): Promise<boolean> {
    const like = Array.from(this.likes.entries()).find(([_, like]) => 
      like.userId === userId && like.postId === postId
    );
    if (like) {
      return this.likes.delete(like[0]);
    }
    return false;
  }
}

export const storage = new MemStorage();
