import type { AdapterAccountType } from "@auth/core/adapters"
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core"
 

 
export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
})
 
export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
)
 
export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})
 
export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ]
)
 
export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    {
      compositePK: primaryKey({
        columns: [authenticator.userId, authenticator.credentialID],
      }),
    },
  ]
)




export const userStores = pgTable("user_store", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  store: jsonb("store").notNull().$defaultFn(() => ({})),
})

// GitHub Issues Cache Table for Dynamic Skill-Based Filtering
export const githubIssuesCache = pgTable("github_issues_cache", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  cacheKey: text("cache_key").notNull().unique(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().$defaultFn(() => new Date()),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  dataType: text("data_type").notNull(), // 'issues', 'languages', 'topics'
})

// Indexes for efficient cache lookups
export const githubIssuesCacheIndexes = {
  cacheKeyIdx: "github_issues_cache_cache_key_idx",
  expiresAtIdx: "github_issues_cache_expires_at_idx",
  dataTypeIdx: "github_issues_cache_data_type_idx",
}

// TypeScript interfaces for GitHub data types
export interface GitHubIssue {
  id: string;
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed';
  html_url: string;
  created_at: string;
  updated_at: string;
  labels: string[];
  repository_name: string;
  repository_full_name: string;
  repository_language: string;
  repository_topics: string[];
  difficulty_labels: string[];
}

export interface FilterCriteria {
  language: string | null;
  topic: string | null;
  session_id: string;
}

export interface FilterResult {
  issues: GitHubIssue[];
  total_count: number;
  filter_applied: FilterCriteria;
  cache_timestamp: string;
  is_from_cache: boolean;
}

export interface CacheEntry {
  cache_key: string;
  data: any;
  created_at: Date;
  expires_at: Date;
  data_type: 'issues' | 'languages' | 'topics';
}