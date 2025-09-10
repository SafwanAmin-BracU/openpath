#!/usr/bin/env node

/**
 * Skills System Seeding Script
 * Run this to populate the database with initial skills development data
 */

import { seedSkillsData } from "./src/server/app/skills/seed";

async function main() {
  console.log("🚀 Starting OpenPath Skills System Seeding...");

  try {
    await seedSkillsData();
    console.log("✨ Skills system seeded successfully!");
  } catch (error) {
    console.error("💥 Seeding failed:", error);
    process.exit(1);
  }
}

main();
