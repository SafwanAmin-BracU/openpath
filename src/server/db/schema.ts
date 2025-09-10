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
  difficulty: string | null;
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

// Contributions Tracking Tables
export const contributions = pgTable("contributions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  prId: text("pr_id").notNull(), // GitHub PR ID
  prNumber: integer("pr_number").notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  repositoryName: text("repository_name").notNull(),
  repositoryOwner: text("repository_owner").notNull(),
  mergedAt: timestamp("merged_at", { mode: "date" }).notNull(),
  additions: integer("additions").notNull().default(0),
  deletions: integer("deletions").notNull().default(0),
  changedFiles: integer("changed_files").notNull().default(0),
  primaryLanguage: text("primary_language"),
  labels: jsonb("labels").$defaultFn(() => []),
  files: jsonb("files").$defaultFn(() => []),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().$defaultFn(() => new Date()),
})

export const skills = pgTable("skills", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // e.g., "JavaScript", "React", "Python"
  category: text("category").notNull(), // e.g., "language", "framework", "tool"
  proficiency: integer("proficiency").notNull().default(1), // 1-10 scale
  firstUsed: timestamp("first_used", { mode: "date" }),
  lastUsed: timestamp("last_used", { mode: "date" }),
  totalContributions: integer("total_contributions").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().$defaultFn(() => new Date()),
})

export const contributionSkills = pgTable("contribution_skills", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  contributionId: text("contribution_id")
    .notNull()
    .references(() => contributions.id, { onDelete: "cascade" }),
  skillId: text("skill_id")
    .notNull()
    .references(() => skills.id, { onDelete: "cascade" }),
  confidence: integer("confidence").notNull().default(1), // How confident we are in this skill detection
  createdAt: timestamp("created_at", { mode: "date" }).notNull().$defaultFn(() => new Date()),
})

// Impact Metrics Tables
export const resolvedIssues = pgTable("resolved_issues", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  issueId: text("issue_id").notNull(),
  issueNumber: integer("issue_number").notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  repositoryName: text("repository_name").notNull(),
  repositoryOwner: text("repository_owner").notNull(),
  resolvedAt: timestamp("resolved_at", { mode: "date" }).notNull(),
  resolvedBy: text("resolved_by").notNull(), // PR that resolved this issue
  labels: jsonb("labels").$defaultFn(() => []),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().$defaultFn(() => new Date()),
})

export const contributionMetrics = pgTable("contribution_metrics", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  period: text("period").notNull(), // 'daily', 'weekly', 'monthly', 'yearly'
  periodStart: timestamp("period_start", { mode: "date" }).notNull(),
  periodEnd: timestamp("period_end", { mode: "date" }).notNull(),
  totalContributions: integer("total_contributions").notNull().default(0),
  totalAdditions: integer("total_additions").notNull().default(0),
  totalDeletions: integer("total_deletions").notNull().default(0),
  totalFilesChanged: integer("total_files_changed").notNull().default(0),
  resolvedIssues: integer("resolved_issues").notNull().default(0),
  repositoriesContributed: integer("repositories_contributed").notNull().default(0),
  languagesUsed: jsonb("languages_used").$defaultFn(() => []),
  skillsDemonstrated: jsonb("skills_demonstrated").$defaultFn(() => []),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().$defaultFn(() => new Date()),
})

// Opportunity Matching Tables
export const opportunityRecommendations = pgTable("opportunity_recommendation", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  repoId: text("repo_id").notNull(), // GitHub repository ID
  repoName: text("repo_name").notNull(),
  repoOwner: text("repo_owner").notNull(),
  repoFullName: text("repo_full_name").notNull(),
  issueId: text("issue_id").notNull(), // GitHub issue ID
  issueNumber: integer("issue_number").notNull(),
  issueTitle: text("issue_title").notNull(),
  issueUrl: text("issue_url").notNull(),
  score: integer("score").notNull(), // 1-10 recommendation score
  difficulty: text("difficulty").notNull(), // 'beginner', 'intermediate', 'advanced'
  reason: text("reason").notNull(), // Why this was recommended
  projectViability: integer("project_viability").notNull(), // 1-10 viability score
  createdAt: timestamp("created_at", { mode: "date" }).notNull().$defaultFn(() => new Date()),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(), // When to refresh recommendation
})

export const projectViability = pgTable("project_viability", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  repoId: text("repo_id").notNull().unique(), // GitHub repository ID
  repoName: text("repo_name").notNull(),
  repoOwner: text("repo_owner").notNull(),
  repoFullName: text("repo_full_name").notNull(),
  score: integer("score").notNull(), // 1-10 viability score
  hasReadme: boolean("has_readme").notNull().default(false),
  hasContributing: boolean("has_contributing").notNull().default(false),
  hasCodeOfConduct: boolean("has_code_of_conduct").notNull().default(false),
  avgResponseTimeDays: integer("avg_response_time_days"), // Average maintainer response time
  contributorsPast3Months: integer("contributors_past_3_months").notNull().default(0),
  recentCommitsPastMonth: integer("recent_commits_past_month").notNull().default(0),
  openIssuesCount: integer("open_issues_count").notNull().default(0),
  totalIssuesCount: integer("total_issues_count").notNull().default(0),
  computedAt: timestamp("computed_at", { mode: "date" }).notNull().$defaultFn(() => new Date()),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(), // When to refresh viability score
})

// TypeScript interfaces for contribution tracking
export interface Contribution {
  id: string;
  userId: string;
  prId: string;
  prNumber: number;
  title: string;
  url: string;
  repositoryName: string;
  repositoryOwner: string;
  mergedAt: Date;
  additions: number;
  deletions: number;
  changedFiles: number;
  primaryLanguage: string | null;
  labels: string[];
  files: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Skill {
  id: string;
  userId: string;
  name: string;
  category: string;
  proficiency: number;
  firstUsed?: Date;
  lastUsed?: Date;
  totalContributions: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContributionSkill {
  id: string;
  contributionId: string;
  skillId: string;
  confidence: number;
  createdAt: Date;
}

export interface ResolvedIssue {
  id: string;
  userId: string;
  issueId: string;
  issueNumber: number;
  title: string;
  url: string;
  repositoryName: string;
  repositoryOwner: string;
  resolvedAt: Date;
  resolvedBy: string;
  labels: string[];
  createdAt: Date;
}

export interface ContributionMetrics {
  id: string;
  userId: string;
  period: string;
  periodStart: Date;
  periodEnd: Date;
  totalContributions: number;
  totalAdditions: number;
  totalDeletions: number;
  totalFilesChanged: number;
  resolvedIssues: number;
  repositoriesContributed: number;
  languagesUsed: string[];
  skillsDemonstrated: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Opportunity Matching Interfaces
export interface OpportunityRecommendation {
  id: string;
  userId: string;
  repoId: string;
  repoName: string;
  repoOwner: string;
  repoFullName: string;
  issueId: string;
  issueNumber: number;
  issueTitle: string;
  issueUrl: string;
  score: number; // 1-10 recommendation score
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  reason: string;
  projectViability: number; // 1-10 viability score
  createdAt: Date;
  expiresAt: Date;
}

export interface ProjectViability {
  id: string;
  repoId: string;
  repoName: string;
  repoOwner: string;
  repoFullName: string;
  score: number; // 1-10 viability score
  hasReadme: boolean;
  hasContributing: boolean;
  hasCodeOfConduct: boolean;
  avgResponseTimeDays?: number;
  contributorsPast3Months: number;
  recentCommitsPastMonth: number;
  openIssuesCount: number;
  totalIssuesCount: number;
  computedAt: Date;
  expiresAt: Date;
}

export interface IssueRecommendation {
  issue: GitHubIssue;
  repo: {
    id: string;
    name: string;
    owner: string;
    full_name: string;
    language: string;
    topics: string[];
  };
  reason: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  projectViability: number;
}