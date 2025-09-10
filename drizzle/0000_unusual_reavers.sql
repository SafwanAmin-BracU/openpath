CREATE TABLE "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "authenticator" (
	"credentialID" text NOT NULL,
	"userId" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"credentialPublicKey" text NOT NULL,
	"counter" integer NOT NULL,
	"credentialDeviceType" text NOT NULL,
	"credentialBackedUp" boolean NOT NULL,
	"transports" text,
	CONSTRAINT "authenticator_credentialID_unique" UNIQUE("credentialID")
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	"category" text NOT NULL,
	"criteria" jsonb NOT NULL,
	"points" integer DEFAULT 10 NOT NULL,
	"rarity" text DEFAULT 'common' NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "badges_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "contribution_metrics" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"period" text NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"total_contributions" integer DEFAULT 0 NOT NULL,
	"total_additions" integer DEFAULT 0 NOT NULL,
	"total_deletions" integer DEFAULT 0 NOT NULL,
	"total_files_changed" integer DEFAULT 0 NOT NULL,
	"resolved_issues" integer DEFAULT 0 NOT NULL,
	"repositories_contributed" integer DEFAULT 0 NOT NULL,
	"languages_used" jsonb,
	"skills_demonstrated" jsonb,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contribution_skills" (
	"id" text PRIMARY KEY NOT NULL,
	"contribution_id" text NOT NULL,
	"skill_id" text NOT NULL,
	"confidence" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contributions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"pr_id" text NOT NULL,
	"pr_number" integer NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"repository_name" text NOT NULL,
	"repository_owner" text NOT NULL,
	"merged_at" timestamp NOT NULL,
	"additions" integer DEFAULT 0 NOT NULL,
	"deletions" integer DEFAULT 0 NOT NULL,
	"changed_files" integer DEFAULT 0 NOT NULL,
	"primary_language" text,
	"labels" jsonb,
	"files" jsonb,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "etiquette_guides" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"difficulty" text NOT NULL,
	"estimated_time" integer NOT NULL,
	"lessons" jsonb NOT NULL,
	"quiz" jsonb NOT NULL,
	"passing_score" integer DEFAULT 70 NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "github_issues_cache" (
	"id" text PRIMARY KEY NOT NULL,
	"cache_key" text NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp NOT NULL,
	"expires_at" timestamp NOT NULL,
	"data_type" text NOT NULL,
	CONSTRAINT "github_issues_cache_cache_key_unique" UNIQUE("cache_key")
);
--> statement-breakpoint
CREATE TABLE "opportunity_recommendation" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"repo_id" text NOT NULL,
	"repo_name" text NOT NULL,
	"repo_owner" text NOT NULL,
	"repo_full_name" text NOT NULL,
	"issue_id" text NOT NULL,
	"issue_number" integer NOT NULL,
	"issue_title" text NOT NULL,
	"issue_url" text NOT NULL,
	"score" integer NOT NULL,
	"difficulty" text NOT NULL,
	"reason" text NOT NULL,
	"project_viability" integer NOT NULL,
	"created_at" timestamp NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_viability" (
	"id" text PRIMARY KEY NOT NULL,
	"repo_id" text NOT NULL,
	"repo_name" text NOT NULL,
	"repo_owner" text NOT NULL,
	"repo_full_name" text NOT NULL,
	"score" integer NOT NULL,
	"has_readme" boolean DEFAULT false NOT NULL,
	"has_contributing" boolean DEFAULT false NOT NULL,
	"has_code_of_conduct" boolean DEFAULT false NOT NULL,
	"avg_response_time_days" integer,
	"contributors_past_3_months" integer DEFAULT 0 NOT NULL,
	"recent_commits_past_month" integer DEFAULT 0 NOT NULL,
	"open_issues_count" integer DEFAULT 0 NOT NULL,
	"total_issues_count" integer DEFAULT 0 NOT NULL,
	"computed_at" timestamp NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "project_viability_repo_id_unique" UNIQUE("repo_id")
);
--> statement-breakpoint
CREATE TABLE "resolved_issues" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"issue_id" text NOT NULL,
	"issue_number" integer NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"repository_name" text NOT NULL,
	"repository_owner" text NOT NULL,
	"resolved_at" timestamp NOT NULL,
	"resolved_by" text NOT NULL,
	"labels" jsonb,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"proficiency" integer DEFAULT 1 NOT NULL,
	"first_used" timestamp,
	"last_used" timestamp,
	"total_contributions" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tutorials" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"difficulty" text NOT NULL,
	"estimated_time" integer NOT NULL,
	"steps" jsonb NOT NULL,
	"validation_rules" jsonb NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"badge_id" text NOT NULL,
	"earned_at" timestamp NOT NULL,
	"earned_through" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_etiquette_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"guide_id" text NOT NULL,
	"current_lesson" integer DEFAULT 0 NOT NULL,
	"completed_lessons" jsonb,
	"quiz_answers" jsonb,
	"quiz_score" integer,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_store" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"store" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_tutorial_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"tutorial_id" text NOT NULL,
	"current_step" integer DEFAULT 0 NOT NULL,
	"completed_steps" jsonb,
	"answers" jsonb,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"emailVerified" timestamp,
	"image" text,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authenticator" ADD CONSTRAINT "authenticator_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contribution_metrics" ADD CONSTRAINT "contribution_metrics_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contribution_skills" ADD CONSTRAINT "contribution_skills_contribution_id_contributions_id_fk" FOREIGN KEY ("contribution_id") REFERENCES "public"."contributions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contribution_skills" ADD CONSTRAINT "contribution_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_recommendation" ADD CONSTRAINT "opportunity_recommendation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resolved_issues" ADD CONSTRAINT "resolved_issues_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skills" ADD CONSTRAINT "skills_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_etiquette_progress" ADD CONSTRAINT "user_etiquette_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_etiquette_progress" ADD CONSTRAINT "user_etiquette_progress_guide_id_etiquette_guides_id_fk" FOREIGN KEY ("guide_id") REFERENCES "public"."etiquette_guides"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_store" ADD CONSTRAINT "user_store_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tutorial_progress" ADD CONSTRAINT "user_tutorial_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tutorial_progress" ADD CONSTRAINT "user_tutorial_progress_tutorial_id_tutorials_id_fk" FOREIGN KEY ("tutorial_id") REFERENCES "public"."tutorials"("id") ON DELETE cascade ON UPDATE no action;