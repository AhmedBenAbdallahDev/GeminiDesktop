// Remove server-only for compatibility
// import "server-only";
import { setupDatabase, getDatabase } from "../auto-setup";

// Initialize database connection automatically
let dbPromise: Promise<any> | null = null;
let dbInstance: any = null;
let isInitializing = false;

export async function initDb() {
  if (!dbPromise) {
    dbPromise = setupDatabase().then(({ db }) => {
      dbInstance = db;
      isInitializing = false;
      return db;
    });
  }
  return dbPromise;
}

// Initialize immediately when this module loads
if (!isInitializing && !dbInstance) {
  isInitializing = true;
  initDb().catch(console.error);
}

// Synchronous access for repositories (auto-initialized)
const createDbProxy = () =>
  new Proxy({} as any, {
    get(_target, prop) {
      // If we're still initializing, wait a bit
      if (isInitializing && !dbInstance) {
        throw new Error(
          `Database is still initializing. Please wait or use async initDb().`,
        );
      }

      if (!dbInstance) {
        // If database isn't initialized yet, try to get it from the global state
        try {
          const { db } = getDatabase();
          dbInstance = db;
        } catch (error) {
          // If that fails, try to initialize it immediately
          isInitializing = true;
          initDb()
            .then(() => {
              isInitializing = false;
            })
            .catch(console.error);
          throw new Error(
            `Database not ready. Please ensure autonomous database is initialized. Error: ${error}`,
          );
        }
      }

      const value = dbInstance[prop];
      if (typeof value === "function") {
        return value.bind(dbInstance);
      }
      return value;
    },
  });

// Main database export
export const pgDb = createDbProxy();
