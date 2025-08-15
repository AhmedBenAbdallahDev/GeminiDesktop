export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Initialize autonomous database system first
    const initDb = await import("./lib/db/init").then(
      (m) => m.initializeAutonomousDatabase,
    );
    await initDb();

    // Then initialize MCP manager
    const init = await import("./lib/ai/mcp/mcp-manager").then(
      (m) => m.initMCPManager,
    );
    await init();
  }
}
