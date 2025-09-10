/**
 * Database seeding script for Skills Development System
 * Run this script to populate the database with initial tutorial, badge, and etiquette data
 */

import { db } from "../../db";
import { tutorials, badges, etiquetteGuides } from "../../db/schema";
import { TUTORIAL_SEED_DATA, BADGE_SEED_DATA, ETIQUETTE_SEED_DATA } from "./seedData";

async function seedSkillsData() {
  console.log("🌱 Starting skills data seeding...");

  try {
    // Seed tutorials
    console.log("📚 Seeding tutorials...");
    for (const tutorial of TUTORIAL_SEED_DATA) {
      await db.insert(tutorials).values(tutorial);
      console.log(`✅ Seeded tutorial: ${tutorial.title}`);
    }

    // Seed badges
    console.log("🏆 Seeding badges...");
    for (const badge of BADGE_SEED_DATA) {
      await db.insert(badges).values(badge);
      console.log(`✅ Seeded badge: ${badge.name}`);
    }

    // Seed etiquette guides
    console.log("🤝 Seeding etiquette guides...");
    for (const guide of ETIQUETTE_SEED_DATA) {
      await db.insert(etiquetteGuides).values(guide);
      console.log(`✅ Seeded etiquette guide: ${guide.title}`);
    }

    console.log("🎉 Skills data seeding completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   - ${TUTORIAL_SEED_DATA.length} tutorials`);
    console.log(`   - ${BADGE_SEED_DATA.length} badges`);
    console.log(`   - ${ETIQUETTE_SEED_DATA.length} etiquette guides`);

  } catch (error) {
    console.error("❌ Error seeding skills data:", error);
    throw error;
  }
}

// Run the seeding function
if (require.main === module) {
  seedSkillsData()
    .then(() => {
      console.log("✅ Seeding completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}

export { seedSkillsData };
