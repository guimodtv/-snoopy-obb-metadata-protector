import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  uniqueIndex,
  index,
  bigint,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with balance, referrer_id, and api_key for monetization and API access.
 */
export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    email: varchar("email", { length: 320 }).notNull().unique(),
    name: text("name"),
    passwordHash: text("passwordHash"), // For email/password auth
    loginMethod: varchar("loginMethod", { length: 64 }), // 'oauth', 'email', etc
    role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
    
    // Monetization fields
    balance: decimal("balance", { precision: 12, scale: 2 }).default("0.00").notNull(),
    totalEarnings: decimal("totalEarnings", { precision: 12, scale: 2 }).default("0.00").notNull(),
    totalClicks: int("totalClicks").default(0).notNull(),
    
    // Referral system
    referrerId: int("referrerId"),
    referralCode: varchar("referralCode", { length: 32 }).unique(),
    referralCommissionEarned: decimal("referralCommissionEarned", { precision: 12, scale: 2 }).default("0.00").notNull(),
    
    // API access
    apiKey: varchar("apiKey", { length: 64 }).unique(),
    apiKeyCreatedAt: timestamp("apiKeyCreatedAt"),
    
    // Status
    isActive: boolean("isActive").default(true).notNull(),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  (table) => ({
    referrerIdIdx: index("referrerId_idx").on(table.referrerId),
    apiKeyIdx: index("apiKey_idx").on(table.apiKey),
    emailIdx: index("email_idx").on(table.email),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Short links table - stores the shortened URLs and their metadata
 */
export const shortLinks = mysqlTable(
  "short_links",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    originalUrl: text("originalUrl").notNull(),
    shortCode: varchar("shortCode", { length: 32 }).notNull().unique(),
    
    // Statistics
    clicks: int("clicks").default(0).notNull(),
    validClicks: int("validClicks").default(0).notNull(),
    earnings: decimal("earnings", { precision: 12, scale: 2 }).default("0.00").notNull(),
    
    // Metadata
    title: varchar("title", { length: 255 }),
    description: text("description"),
    isActive: boolean("isActive").default(true).notNull(),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("userId_idx").on(table.userId),
    shortCodeIdx: uniqueIndex("shortCode_idx").on(table.shortCode),
  })
);

export type ShortLink = typeof shortLinks.$inferSelect;
export type InsertShortLink = typeof shortLinks.$inferInsert;

/**
 * Clicks table - tracks individual clicks on shortened links
 */
export const clicks = mysqlTable(
  "clicks",
  {
    id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
    linkId: int("linkId").notNull(),
    userId: int("userId").notNull(),
    
    // Click details
    ipAddress: varchar("ipAddress", { length: 45 }).notNull(), // IPv4 or IPv6
    userAgent: text("userAgent"),
    referrer: text("referrer"),
    
    // Fraud detection
    isValid: boolean("isValid").default(true).notNull(),
    fraudReason: varchar("fraudReason", { length: 255 }), // Reason if invalid
    
    // Earnings
    earningsGenerated: decimal("earningsGenerated", { precision: 12, scale: 2 }).default("0.00").notNull(),
    
    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (table) => ({
    linkIdIdx: index("linkId_idx").on(table.linkId),
    userIdIdx: index("userId_idx").on(table.userId),
    ipAddressIdx: index("ipAddress_idx").on(table.ipAddress),
    timestampIdx: index("timestamp_idx").on(table.timestamp),
  })
);

export type Click = typeof clicks.$inferSelect;
export type InsertClick = typeof clicks.$inferInsert;

/**
 * Withdrawals table - tracks user withdrawal requests
 */
export const withdrawals = mysqlTable(
  "withdrawals",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    
    // Status: pending, paid, rejected
    status: mysqlEnum("status", ["pending", "paid", "rejected"]).default("pending").notNull(),
    
    // Admin notes
    notes: text("notes"),
    
    requestedAt: timestamp("requestedAt").defaultNow().notNull(),
    processedAt: timestamp("processedAt"),
    processedBy: int("processedBy"), // Admin user ID
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("userId_idx").on(table.userId),
    statusIdx: index("status_idx").on(table.status),
  })
);

export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertWithdrawal = typeof withdrawals.$inferInsert;

/**
 * Global settings table - stores CPM and other configurable values
 */
export const settings = mysqlTable("settings", {
  id: int("id").autoincrement().primaryKey(),
  
  // CPM (Cost Per Mille) - earnings per 1000 clicks
  cpm: decimal("cpm", { precision: 10, scale: 4 }).default("0.50").notNull(),
  
  // Referral commission percentage (e.g., 30 for 30%)
  referralCommissionPercentage: decimal("referralCommissionPercentage", { precision: 5, scale: 2 }).default("30.00").notNull(),
  
  // Minimum withdrawal amount
  minimumWithdrawal: decimal("minimumWithdrawal", { precision: 12, scale: 2 }).default("10.00").notNull(),
  
  // Maximum clicks per IP per link per hour (anti-fraud)
  maxClicksPerIpPerHour: int("maxClicksPerIpPerHour").default(5).notNull(),
  
  // System status
  isSystemActive: boolean("isSystemActive").default(true).notNull(),
  
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = typeof settings.$inferInsert;

/**
 * Referrals table - tracks referral relationships and commissions
 */
export const referrals = mysqlTable(
  "referrals",
  {
    id: int("id").autoincrement().primaryKey(),
    referrerId: int("referrerId").notNull(),
    referredUserId: int("referredUserId").notNull(),
    
    // Commission tracking
    totalCommissionEarned: decimal("totalCommissionEarned", { precision: 12, scale: 2 }).default("0.00").notNull(),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    referrerIdIdx: index("referrerId_idx").on(table.referrerId),
    referredUserIdIdx: index("referredUserId_idx").on(table.referredUserId),
  })
);

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

/**
 * Fraud attempts table - logs suspicious activity
 */
export const fraudAttempts = mysqlTable(
  "fraud_attempts",
  {
    id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
    linkId: int("linkId"),
    userId: int("userId"),
    ipAddress: varchar("ipAddress", { length: 45 }).notNull(),
    
    // Fraud type
    fraudType: varchar("fraudType", { length: 64 }).notNull(), // 'multiple_clicks_same_ip', 'bot_detected', etc
    
    // Details
    details: text("details"),
    
    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (table) => ({
    linkIdIdx: index("linkId_idx").on(table.linkId),
    userIdIdx: index("userId_idx").on(table.userId),
    ipAddressIdx: index("ipAddress_idx").on(table.ipAddress),
  })
);

export type FraudAttempt = typeof fraudAttempts.$inferSelect;
export type InsertFraudAttempt = typeof fraudAttempts.$inferInsert;
