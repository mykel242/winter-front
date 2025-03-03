// start-server.js
/**
 * Frontend Development Server
 * ---------------------------
 * ✅ Supports named CLI arguments (--api, --port)
 * ✅ Allows changing the PORT without specifying API_URL
 * ✅ Uses .env file for default configuration
 * ✅ Provides detailed error handling
 * ✅ Gracefully shuts down on exit
 */

import { exec } from "child_process";
import dotenv from "dotenv";
import fs from "fs";

// Load environment variables from .env file
dotenv.config();

// Parse CLI arguments (supports --api and --port)
const args = process.argv.slice(2);
const argMap = args.reduce((map, arg) => {
  const [key, value] = arg.split("=");
  if (key.startsWith("--")) {
    map[key.replace("--", "")] = value;
  }
  return map;
}, {});

// Get values from CLI, .env, or fallback defaults
const apiUrl = argMap.api || process.env.API_URL || "http://localhost:3000";
const port = argMap.port || process.env.PORT || 8080;

// Inject API_URL into a temporary config file
const configContent = `window.API_URL = "${apiUrl}";`;
fs.writeFileSync("config-generated.js", configContent);

// Start the frontend server using live-server
console.log(`🔹 Starting live-server on PORT: ${port}`);
console.log(`🔹 Using API URL: ${apiUrl}`);

// Start the frontend server
const serverProcess = exec(
  `npx live-server --port=${port}`,
  (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error starting server: ${error.message}`);
      return;
    }
    console.log(stdout);
    console.error(stderr);
  },
);

// Graceful Shutdown Handler
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...");
  serverProcess.kill();
  process.exit();
});
