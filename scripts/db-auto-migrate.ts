#!/usr/bin/env tsx
import "load-env";
import { initializeAutonomousDatabase } from "../src/lib/db/init";

// Simple logger for scripts
const logger = {
  info: (...args: any[]) => console.log("[INFO]", ...args),
  error: (...args: any[]) => console.error("[ERROR]", ...args),
};

async function main() {
  try {
    logger.info("🚀 Starting autonomous database migration...");

    // This will auto-detect database type and run migrations
    await initializeAutonomousDatabase();

    logger.info("✅ Database migration completed successfully!");
    process.exit(0);
  } catch (error) {
    logger.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

main();
