import { type User, type InsertUser, type Creator, type InsertCreator, type Post, type InsertPost, type Subscription, type InsertSubscription, type Tip, type InsertTip, type Like, type InsertLike, type Conversation, type InsertConversation, type Message, type InsertMessage, type Comment, type InsertComment, type CommentVote, type InsertCommentVote, type PostUnlock, type InsertPostUnlock, type WalletNonce, type InsertWalletNonce } from "@shared/schema";
import { randomUUID } from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
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

  // Conversations
  getConversation(id: string): Promise<Conversation | undefined>;
  getConversationByUsers(user1Id: string, user2Id: string): Promise<Conversation | undefined>;
  getConversationsByUser(userId: string): Promise<Array<Conversation & { otherUser: User; lastMessage?: Message; unreadCount: number }>>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, conversation: Partial<Conversation>): Promise<Conversation | undefined>;

  // Messages
  getMessage(id: string): Promise<Message | undefined>;
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(conversationId: string, userId: string): Promise<void>;

  // Comments
  getComment(id: string): Promise<Comment | undefined>;
  getCommentsByPost(postId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: string, comment: Partial<Comment>): Promise<Comment | undefined>;
  deleteComment(id: string): Promise<boolean>;

  // Comment Votes
  getCommentVote(commentId: string, userId: string): Promise<CommentVote | undefined>;
  createCommentVote(vote: InsertCommentVote): Promise<CommentVote>;
  deleteCommentVote(commentId: string, userId: string): Promise<boolean>;
  getCommentVotesByComment(commentId: string): Promise<CommentVote[]>;

  // Post Unlocks
  getPostUnlock(postId: string, userId: string): Promise<PostUnlock | undefined>;
  createPostUnlock(unlock: InsertPostUnlock): Promise<PostUnlock>;
  getPostUnlocksByUser(userId: string): Promise<PostUnlock[]>;

  // Wallet Nonces
  getWalletNonce(nonce: string, userId: string): Promise<WalletNonce | undefined>;
  createWalletNonce(walletNonce: InsertWalletNonce): Promise<WalletNonce>;
  updateWalletNonce(id: string, walletNonce: Partial<WalletNonce>): Promise<WalletNonce | undefined>;

  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private creators: Map<string, Creator>;
  private posts: Map<string, Post>;
  private subscriptions: Map<string, Subscription>;
  private tips: Map<string, Tip>;
  private likes: Map<string, Like>;
  private conversations: Map<string, Conversation>;
  private messages: Map<string, Message>;
  private comments: Map<string, Comment>;
  private commentVotes: Map<string, CommentVote>;
  private postUnlocks: Map<string, PostUnlock>;
  private walletNonces: Map<string, WalletNonce>;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.creators = new Map();
    this.posts = new Map();
    this.subscriptions = new Map();
    this.tips = new Map();
    this.likes = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.comments = new Map();
    this.commentVotes = new Map();
    this.postUnlocks = new Map();
    this.walletNonces = new Map();
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

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === username);
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.walletAddress === walletAddress);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      role: insertUser.role || "supporter",
      walletAddress: insertUser.walletAddress || null,
      walletVerified: insertUser.walletVerified || false,
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
      banner: insertCreator.banner || null,
      bio: insertCreator.bio || null,
      avatar: insertCreator.avatar || null,
      category: insertCreator.category || null,
      fandomName: insertCreator.fandomName || "Supporters",
      tiers: (insertCreator.tiers as any) || [],
      links: (insertCreator.links as any) || {},
      payoutAddress: insertCreator.payoutAddress || null,
      totalEarnings: insertCreator.totalEarnings || 0,
      subscriberCount: insertCreator.subscriberCount || 0,
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
      content: insertPost.content || null,
      mediaUrl: insertPost.mediaUrl || null,
      mediaType: insertPost.mediaType || null,
      price: insertPost.price || 0,
      tier: insertPost.tier || null,
      likes: 0,
      visibility: insertPost.visibility || "public",
      published: insertPost.published ?? true,
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
      active: insertSubscription.active ?? true,
      startDate: insertSubscription.startDate || new Date(),
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
      creatorId: insertTip.creatorId || null,
      postId: insertTip.postId || null,
      message: insertTip.message || null,
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

  // Conversations
  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationByUsers(user1Id: string, user2Id: string): Promise<Conversation | undefined> {
    return Array.from(this.conversations.values()).find(conv => 
      (conv.user1Id === user1Id && conv.user2Id === user2Id) ||
      (conv.user1Id === user2Id && conv.user2Id === user1Id)
    );
  }

  async getConversationsByUser(userId: string): Promise<Array<Conversation & { otherUser: User; lastMessage?: Message; unreadCount: number }>> {
    const userConversations = Array.from(this.conversations.values())
      .filter(conv => conv.user1Id === userId || conv.user2Id === userId)
      .sort((a, b) => new Date(b.lastMessageAt!).getTime() - new Date(a.lastMessageAt!).getTime());

    const result = [];
    for (const conv of userConversations) {
      const otherUserId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;
      const otherUser = await this.getUser(otherUserId);
      if (!otherUser) continue;

      const messages = await this.getMessagesByConversation(conv.id);
      const lastMessage = messages[messages.length - 1];
      const unreadCount = messages.filter(msg => msg.senderId !== userId && !msg.read).length;

      result.push({
        ...conv,
        otherUser,
        lastMessage,
        unreadCount
      });
    }
    return result;
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const conversation: Conversation = { 
      ...insertConversation,
      id, 
      lastMessageAt: new Date(),
      createdAt: new Date() 
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: string, convUpdate: Partial<Conversation>): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;
    const updatedConversation = { ...conversation, ...convUpdate };
    this.conversations.set(id, updatedConversation);
    return updatedConversation;
  }

  // Messages
  async getMessage(id: string): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = { 
      ...insertMessage,
      read: insertMessage.read ?? false,
      id, 
      createdAt: new Date() 
    };
    this.messages.set(id, message);

    // Update conversation's last message timestamp
    await this.updateConversation(insertMessage.conversationId, {
      lastMessageAt: new Date()
    });

    return message;
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    const messages = await this.getMessagesByConversation(conversationId);
    for (const message of messages) {
      if (message.senderId !== userId && !message.read) {
        const updatedMessage = { ...message, read: true };
        this.messages.set(message.id, updatedMessage);
      }
    }
  }

  // Comments
  async getComment(id: string): Promise<Comment | undefined> {
    return this.comments.get(id);
  }

  async getCommentsByPost(postId: string): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.postId === postId && !comment.isHidden)
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = {
      ...insertComment,
      isHidden: insertComment.isHidden ?? false,
      upvotes: 0,
      downvotes: 0,
      id,
      createdAt: new Date()
    };
    this.comments.set(id, comment);
    return comment;
  }

  async updateComment(id: string, commentUpdate: Partial<Comment>): Promise<Comment | undefined> {
    const comment = this.comments.get(id);
    if (!comment) return undefined;
    const updatedComment = { ...comment, ...commentUpdate };
    this.comments.set(id, updatedComment);
    return updatedComment;
  }

  async deleteComment(id: string): Promise<boolean> {
    return this.comments.delete(id);
  }

  // Comment Votes
  async getCommentVote(commentId: string, userId: string): Promise<CommentVote | undefined> {
    return Array.from(this.commentVotes.values()).find(vote => 
      vote.commentId === commentId && vote.userId === userId
    );
  }

  async createCommentVote(insertVote: InsertCommentVote): Promise<CommentVote> {
    const id = randomUUID();
    const vote: CommentVote = {
      ...insertVote,
      id,
      createdAt: new Date()
    };
    this.commentVotes.set(id, vote);

    // Update comment vote counts
    const comment = await this.getComment(insertVote.commentId);
    if (comment) {
      const votes = await this.getCommentVotesByComment(insertVote.commentId);
      const upvotes = votes.filter(v => v.voteType === 'upvote').length;
      const downvotes = votes.filter(v => v.voteType === 'downvote').length;
      await this.updateComment(insertVote.commentId, { upvotes, downvotes });
    }

    return vote;
  }

  async deleteCommentVote(commentId: string, userId: string): Promise<boolean> {
    const vote = Array.from(this.commentVotes.entries()).find(([_, vote]) =>
      vote.commentId === commentId && vote.userId === userId
    );
    if (vote) {
      const deleted = this.commentVotes.delete(vote[0]);
      
      // Update comment vote counts
      const comment = await this.getComment(commentId);
      if (comment) {
        const votes = await this.getCommentVotesByComment(commentId);
        const upvotes = votes.filter(v => v.voteType === 'upvote').length;
        const downvotes = votes.filter(v => v.voteType === 'downvote').length;
        await this.updateComment(commentId, { upvotes, downvotes });
      }
      
      return deleted;
    }
    return false;
  }

  async getCommentVotesByComment(commentId: string): Promise<CommentVote[]> {
    return Array.from(this.commentVotes.values()).filter(vote => vote.commentId === commentId);
  }

  // Post Unlocks
  async getPostUnlock(postId: string, userId: string): Promise<PostUnlock | undefined> {
    return Array.from(this.postUnlocks.values()).find(unlock =>
      unlock.postId === postId && unlock.userId === userId
    );
  }

  async createPostUnlock(insertUnlock: InsertPostUnlock): Promise<PostUnlock> {
    const id = randomUUID();
    const unlock: PostUnlock = {
      ...insertUnlock,
      id,
      createdAt: new Date()
    };
    this.postUnlocks.set(id, unlock);
    return unlock;
  }

  async getPostUnlocksByUser(userId: string): Promise<PostUnlock[]> {
    return Array.from(this.postUnlocks.values()).filter(unlock => unlock.userId === userId);
  }

  // Wallet Nonces
  async getWalletNonce(nonce: string, userId: string): Promise<WalletNonce | undefined> {
    return Array.from(this.walletNonces.values()).find(walletNonce => 
      walletNonce.nonce === nonce && walletNonce.userId === userId
    );
  }

  async createWalletNonce(insertNonce: InsertWalletNonce): Promise<WalletNonce> {
    const id = randomUUID();
    const walletNonce: WalletNonce = {
      ...insertNonce,
      used: insertNonce.used || false,
      id,
      createdAt: new Date()
    };
    this.walletNonces.set(id, walletNonce);
    return walletNonce;
  }

  async updateWalletNonce(id: string, nonceUpdate: Partial<WalletNonce>): Promise<WalletNonce | undefined> {
    const nonce = this.walletNonces.get(id);
    if (!nonce) return undefined;
    const updatedNonce = { ...nonce, ...nonceUpdate };
    this.walletNonces.set(id, updatedNonce);
    return updatedNonce;
  }
}

export const storage = new MemStorage();
