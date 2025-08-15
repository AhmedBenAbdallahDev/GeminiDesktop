// Remove server-only for script usage
// import "server-only";
import { setupDatabase, runAutoMigrations } from "./auto-setup";

// Simple logger fallback
const logger = {
  info: (...args: any[]) => console.log("[INFO]", ...args),
  warn: (...args: any[]) => console.warn("[WARN]", ...args),
  error: (...args: any[]) => console.error("[ERROR]", ...args),
};

/**
 * Initialize the autonomous database system
 * This runs automatically when the app starts
 */
export async function initializeAutonomousDatabase(): Promise<void> {
  try {
    logger.info("🚀 Initializing autonomous database system...");

    // Step 1: Setup database connection (online or local fallback)
    const { type } = await setupDatabase();

    logger.info(`📊 Database type: ${type}`);
    logger.info(
      `🔗 Connection: ${type === "postgres" ? "Online PostgreSQL" : "Local PGlite"}`,
    );

    // Step 2: Run migrations automatically
    await runAutoMigrations();

    logger.info("✅ Autonomous database system ready!");

    // Step 3: Create default data if needed
    await createDefaultDataIfNeeded();
  } catch (error) {
    logger.error("❌ Failed to initialize database:", error);
    throw error;
  }
}

/**
 * Create default data on first run
 */
async function createDefaultDataIfNeeded(): Promise<void> {
  try {
    const { initDb } = await import("./pg/db.pg");
    await initDb(); // Initialize database connection

    // Check if we have any users - if not, this is likely a fresh install
    // You can add default data creation logic here
    logger.info("📝 Checking for default data...");

    // Example: Create default admin user, default settings, etc.
    // This is where you'd add any first-run setup logic
  } catch (error) {
    logger.warn("⚠️ Could not check/create default data:", error);
    // Don't fail the entire startup for this
  }
}
