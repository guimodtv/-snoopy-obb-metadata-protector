import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  shortLinks,
  clicks,
  withdrawals,
  settings,
  referrals,
  fraudAttempts,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
      email: user.email,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "loginMethod", "passwordHash"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByApiKey(apiKey: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(users)
    .where(eq(users.apiKey, apiKey))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getShortLinkByCode(shortCode: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(shortLinks)
    .where(eq(shortLinks.shortCode, shortCode))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserShortLinks(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(shortLinks)
    .where(eq(shortLinks.userId, userId))
    .orderBy(desc(shortLinks.createdAt));
}

export async function getSettings() {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(settings).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateSettings(updates: Partial<typeof settings.$inferInsert>) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .update(settings)
    .set(updates)
    .where(eq(settings.id, 1));
  return result;
}

export async function initializeSettings() {
  const db = await getDb();
  if (!db) return null;

  const existing = await getSettings();
  if (existing) return existing;

  await db.insert(settings).values({
    cpm: "0.50",
    referralCommissionPercentage: "30.00",
    minimumWithdrawal: "10.00",
    maxClicksPerIpPerHour: 5,
    isSystemActive: true,
  });

  return await getSettings();
}

export async function createClick(clickData: typeof clicks.$inferInsert) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(clicks).values(clickData);
  return result;
}

export async function getClicksByLinkAndIp(linkId: number, ipAddress: string, hoursAgo: number = 1) {
  const db = await getDb();
  if (!db) return [];

  const timeThreshold = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

  return await db
    .select()
    .from(clicks)
    .where(
      and(
        eq(clicks.linkId, linkId),
        eq(clicks.ipAddress, ipAddress),
        gte(clicks.timestamp, timeThreshold)
      )
    );
}

export async function createWithdrawal(withdrawalData: typeof withdrawals.$inferInsert) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(withdrawals).values(withdrawalData);
  return result;
}

export async function getUserWithdrawals(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(withdrawals)
    .where(eq(withdrawals.userId, userId))
    .orderBy(desc(withdrawals.requestedAt));
}

export async function getPendingWithdrawals() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(withdrawals)
    .where(eq(withdrawals.status, "pending"))
    .orderBy(desc(withdrawals.requestedAt));
}

export async function updateWithdrawal(
  id: number,
  updates: Partial<typeof withdrawals.$inferInsert>
) {
  const db = await getDb();
  if (!db) return null;

  return await db.update(withdrawals).set(updates).where(eq(withdrawals.id, id));
}

export async function createReferral(referralData: typeof referrals.$inferInsert) {
  const db = await getDb();
  if (!db) return null;

  return await db.insert(referrals).values(referralData);
}

export async function getReferralsByReferrer(referrerId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(referrals)
    .where(eq(referrals.referrerId, referrerId));
}

export async function logFraudAttempt(fraudData: typeof fraudAttempts.$inferInsert) {
  const db = await getDb();
  if (!db) return null;

  return await db.insert(fraudAttempts).values(fraudData);
}

export async function getAllUsers(limit: number = 100, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getAllShortLinks(limit: number = 100, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(shortLinks)
    .orderBy(desc(shortLinks.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getAllClicks(limit: number = 100, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(clicks)
    .orderBy(desc(clicks.timestamp))
    .limit(limit)
    .offset(offset);
}

export async function getSystemStats() {
  const db = await getDb();
  if (!db) return null;

  const totalUsers = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users);
  const totalLinks = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(shortLinks);
  const totalClicks = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(clicks);
  const totalEarnings = await db
    .select({ sum: sql<string>`SUM(earnings)` })
    .from(shortLinks);

  return {
    totalUsers: totalUsers[0]?.count || 0,
    totalLinks: totalLinks[0]?.count || 0,
    totalClicks: totalClicks[0]?.count || 0,
    totalEarnings: totalEarnings[0]?.sum || "0.00",
  };
}
