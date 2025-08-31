import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default("supporter"), // "creator" | "supporter"
  createdAt: timestamp("created_at").defaultNow(),
});

export const creators = pgTable("creators", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  handle: text("handle").notNull().unique(),
  name: text("name").notNull(),
  bio: text("bio"),
  avatar: text("avatar"),
  banner: text("banner"),
  category: text("category"),
  tiers: json("tiers").$type<Array<{
    id: string;
    name: string;
    price: number;
    perks: string[];
  }>>().default([]),
  links: json("links").$type<{
    twitter?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
  }>().default({}),
  payoutAddress: text("payout_address"),
  totalEarnings: integer("total_earnings").default(0),
  subscriberCount: integer("subscriber_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").notNull().references(() => creators.id),
  title: text("title").notNull(),
  content: text("content"),
  mediaUrl: text("media_url"),
  mediaType: text("media_type"), // "image" | "video"
  visibility: text("visibility").notNull().default("public"), // "public" | "members" | "ppv"
  price: integer("price").default(0), // in cents for PPV
  tier: text("tier"), // for member-only content
  likes: integer("likes").default(0),
  published: boolean("published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supporterId: varchar("supporter_id").notNull().references(() => users.id),
  creatorId: varchar("creator_id").notNull().references(() => creators.id),
  tier: text("tier").notNull(),
  amount: integer("amount").notNull(), // in cents
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tips = pgTable("tips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supporterId: varchar("supporter_id").notNull().references(() => users.id),
  creatorId: varchar("creator_id").notNull().references(() => creators.id),
  amount: integer("amount").notNull(), // in cents
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const likes = pgTable("likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  postId: varchar("post_id").notNull().references(() => posts.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCreatorSchema = createInsertSchema(creators).omit({
  id: true,
  createdAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  likes: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

export const insertTipSchema = createInsertSchema(tips).omit({
  id: true,
  createdAt: true,
});

export const insertLikeSchema = createInsertSchema(likes).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Creator = typeof creators.$inferSelect;
export type InsertCreator = z.infer<typeof insertCreatorSchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type Tip = typeof tips.$inferSelect;
export type InsertTip = z.infer<typeof insertTipSchema>;

export type Like = typeof likes.$inferSelect;
export type InsertLike = z.infer<typeof insertLikeSchema>;
