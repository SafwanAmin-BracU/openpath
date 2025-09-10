#!/usr/bin/env node

/**
 * Portfolio Mock Data Seeder
 * Seeds the database with realistic mock data for demonstration purposes
 */

import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, inArray } from "drizzle-orm";
import postgres from "postgres";

// Load environment variables
config();
import {
  contributions,
  skills,
  contributionSkills,
  resolvedIssues,
  contributionMetrics,
  users,
} from "../src/server/db/schema";
import {
  MOCK_CONTRIBUTIONS,
  MOCK_SKILLS,
  MOCK_RESOLVED_ISSUES,
  MOCK_CONTRIBUTION_METRICS,
  generateContributionSkillLinks,
} from "../src/server/app/portfolio/mockData";

// Database connection
const connectionString = process.env.AUTH_DRIZZLE_URL;
if (!connectionString) {
  console.error("❌ AUTH_DRIZZLE_URL environment variable is required");
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function seedMockData() {
  console.log("🌱 Starting portfolio mock data seeding...");

  try {
    // Create mock user if it doesn't exist
    console.log("👤 Creating mock user...");
    const mockUserId = "mock-user-123";

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, mockUserId))
      .limit(1);

    if (existingUser.length === 0) {
      await db.insert(users).values({
        id: mockUserId,
        name: "Mock Student Developer",
        email: "mock.student@example.com",
        emailVerified: new Date(),
        image: "https://avatars.githubusercontent.com/u/12345678?v=4",
      });
      console.log("✅ Mock user created");
    } else {
      console.log("✅ Mock user already exists");
    }

    // Clear existing data for the mock user

    await db.delete(contributionSkills).where(
      inArray(
        contributionSkills.contributionId,
        MOCK_CONTRIBUTIONS.map((_, i) => `mock-contrib-${i + 1}`),
      ),
    );
    await db
      .delete(contributionMetrics)
      .where(eq(contributionMetrics.userId, mockUserId));
    await db
      .delete(resolvedIssues)
      .where(eq(resolvedIssues.userId, mockUserId));
    await db.delete(contributions).where(eq(contributions.userId, mockUserId));
    await db.delete(skills).where(eq(skills.userId, mockUserId));

    console.log("✅ Existing mock data cleared");

    // Insert mock contributions
    console.log("📝 Inserting mock contributions...");
    const contributionInserts = MOCK_CONTRIBUTIONS.map((contrib, index) => ({
      ...contrib,
      id: `mock-contrib-${index + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await db.insert(contributions).values(contributionInserts);
    console.log(`✅ Inserted ${contributionInserts.length} contributions`);

    // Insert mock skills
    console.log("🎯 Inserting mock skills...");
    const skillInserts = MOCK_SKILLS.map((skill, index) => ({
      ...skill,
      id: `mock-skill-${index + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await db.insert(skills).values(skillInserts);
    console.log(`✅ Inserted ${skillInserts.length} skills`);

    // Insert mock resolved issues
    console.log("🔧 Inserting mock resolved issues...");
    const resolvedIssueInserts = MOCK_RESOLVED_ISSUES.map((issue, index) => ({
      ...issue,
      id: `mock-issue-${index + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await db.insert(resolvedIssues).values(resolvedIssueInserts);
    console.log(`✅ Inserted ${resolvedIssueInserts.length} resolved issues`);

    // Insert mock contribution metrics
    console.log("📊 Inserting mock contribution metrics...");
    const metricInserts = MOCK_CONTRIBUTION_METRICS.map((metric, index) => ({
      ...metric,
      id: `mock-metric-${index + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await db.insert(contributionMetrics).values(metricInserts);
    console.log(`✅ Inserted ${metricInserts.length} contribution metrics`);

    // Generate and insert contribution-skill links
    console.log("🔗 Generating contribution-skill relationships...");
    const contributionSkillLinks = generateContributionSkillLinks(
      contributionInserts,
      skillInserts,
    );

    if (contributionSkillLinks.length > 0) {
      const linkInserts = contributionSkillLinks.map((link, index) => ({
        ...link,
        id: `mock-link-${index + 1}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await db.insert(contributionSkills).values(linkInserts);
      console.log(`✅ Inserted ${linkInserts.length} contribution-skill links`);
    }

    console.log("🎉 Portfolio mock data seeding completed successfully!");
    console.log("\n📈 Mock Portfolio Summary:");
    console.log(
      `   • ${contributionInserts.length} contributions across ${new Set(contributionInserts.map((c) => c.repositoryName)).size} repositories`,
    );
    console.log(`   • ${skillInserts.length} skills with proficiency levels`);
    console.log(`   • ${resolvedIssueInserts.length} resolved issues`);
    console.log(`   • ${metricInserts.length} contribution metrics`);
    console.log(
      `   • ${contributionSkillLinks.length} skill-contribution relationships`,
    );

    console.log("\n🚀 You can now view the portfolio at /portfolio");
  } catch (error) {
    console.error("❌ Error seeding mock data:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the seeder
seedMockData();
