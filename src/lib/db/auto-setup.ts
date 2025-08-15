// Remove server-only for now to allow script usage
// import "server-only";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import { join } from "node:path";

// Simple logger fallback if logger module fails
const logger = {
  info: (...args: any[]) => console.log("[INFO]", ...args),
  warn: (...args: any[]) => console.warn("[WARN]", ...args),
  error: (...args: any[]) => console.error("[ERROR]", ...args),
};

// Types for our unified database interface
type UnifiedDatabase = NodePgDatabase | PgliteDatabase;

interface DatabaseConnection {
  db: UnifiedDatabase;
  type: "postgres" | "pglite";
  connectionString: string;
}

let dbInstance: DatabaseConnection | null = null;

/**
 * Auto-setup database with smart fallback:
 * 1. Try online Postgres (Neon, Supabase, etc.) if POSTGRES_URL is set
 * 2. Fallback to local PGlite if POSTGRES_URL is empty/missing
 * 3. Auto-run migrations on startup
 */
export async function setupDatabase(): Promise<DatabaseConnection> {
  if (dbInstance) {
    return dbInstance;
  }

  const postgresUrl = process.env.POSTGRES_URL;

  if (postgresUrl && postgresUrl.trim() !== "") {
    logger.info("🌐 Attempting to connect to online database...");
    try {
      const db = await connectToPostgres(postgresUrl);
      dbInstance = {
        db,
        type: "postgres",
        connectionString: postgresUrl,
      };
      logger.info("✅ Connected to online PostgreSQL database");
      return dbInstance;
    } catch (error) {
      logger.warn(
        "⚠️ Failed to connect to online database, falling back to local PGlite",
        error,
      );
    }
  } else {
    logger.info("📝 POSTGRES_URL not set, using local embedded database");
  }

  // Fallback to PGlite
  logger.info("🚀 Starting local embedded database (PGlite)...");
  const db = await connectToPglite();
  dbInstance = {
    db,
    type: "pglite",
    connectionString: "pglite://local",
  };
  logger.info("✅ Local embedded database ready");
  return dbInstance;
}

/**
 * Connect to online Postgres (Neon, Supabase, etc.)
 */
async function connectToPostgres(url: string): Promise<NodePgDatabase> {
  // Test connection first
  const testDb = drizzlePg(url);

  // Simple connectivity test
  try {
    await testDb.execute(`SELECT 1`);
  } catch (error) {
    throw new Error(`Failed to connect to PostgreSQL: ${error}`);
  }

  return testDb;
}

/**
 * Connect to local PGlite embedded database
 */
async function connectToPglite(): Promise<PgliteDatabase> {
  try {
    const { PGlite } = await import("@electric-sql/pglite");
    const fs = await import("node:fs");
    const path = await import("node:path");

    // Store data in local app directory
    const dataDir = path.join(process.cwd(), "data", "pglite");

    // Ensure directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const pglite = new PGlite({
      dataDir,
      debug: process.env.NODE_ENV === "development" ? 1 : 0,
    });

    // Wait for it to be ready
    await pglite.waitReady;

    const db = drizzlePglite(pglite);

    return db;
  } catch (error) {
    throw new Error(`Failed to start PGlite: ${error}`);
  }
}

/**
 * Get the current database instance
 */
export function getDatabase(): DatabaseConnection {
  if (!dbInstance) {
    throw new Error("Database not initialized. Call setupDatabase() first.");
  }
  return dbInstance;
}

/**
 * Check if we're using online or local database
 */
export function isOnlineDatabase(): boolean {
  return getDatabase().type === "postgres";
}

/**
 * Check if we're using local embedded database
 */
export function isLocalDatabase(): boolean {
  return getDatabase().type === "pglite";
}

/**
 * Run migrations automatically on the active database
 */
export async function runAutoMigrations(): Promise<void> {
  const { db, type } = getDatabase();

  logger.info(`🔄 Running migrations on ${type} database...`);

  try {
    const { migrate } = await import("drizzle-orm/pglite/migrator");
    const { migrate: migratePostgres } = await import(
      "drizzle-orm/node-postgres/migrator"
    );

    const migrationsFolder = join(
      process.cwd(),
      "src",
      "lib",
      "db",
      "migrations",
      "pg",
    );

    if (type === "postgres") {
      await migratePostgres(db as NodePgDatabase, { migrationsFolder });
    } else {
      await migrate(db as PgliteDatabase, { migrationsFolder });
    }

    logger.info("✅ Migrations completed successfully");
  } catch (error) {
    logger.error("❌ Migration failed:", error);
    throw error;
  }
}

/**
 * Graceful shutdown - close database connections
 */
export async function closeDatabaseConnection(): Promise<void> {
  if (dbInstance && dbInstance.type === "pglite") {
    try {
      const pglite = (dbInstance.db as any)._client;
      if (pglite && typeof pglite.close === "function") {
        await pglite.close();
      }
      logger.info("🔒 Database connection closed");
    } catch (error) {
      logger.warn("Warning: Error closing database:", error);
    }
  }
  dbInstance = null;
}
