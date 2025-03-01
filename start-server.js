// start-server.js
/**
 * API_URL Configuration
 * ----------------------
 * The API base URL can be set in three ways (priority order):
 *
 * 1️⃣ **Command-line argument** (Highest priority):
 *    Run the script with an API URL override:
 *    ```sh
 *    node start-server.js https://override-api.com
 *    ```
 *
 * 2️⃣ **.env File** (Loaded via dotenv):
 *    Create a `.env` file in the project root:
 *    ```
 *    API_URL=https://env-api.com
 *    ```
 *    Running `node start-server.js` without arguments will use this value.
 *
 * 3️⃣ **Default Fallback** (Lowest priority):
 *    If no command-line argument or `.env` file is provided, it defaults to:
 *    ```sh
 *    http://localhost:3000
 **/

import { exec } from "child_process";
import dotenv from "dotenv";
import fs from "fs";

// Load environment variables from .env file
dotenv.config();

// Get API URL from command line argument (if provided)
const cliApiUrl = process.argv[2]; // The first argument after `node start-server.js`
const envApiUrl = process.env.API_URL;
const defaultApiUrl = "http://localhost:3000";

// Determine the final API URL (priority: CLI > .env > default)
const apiUrl = cliApiUrl || envApiUrl || defaultApiUrl;

// Inject API_URL into a temporary config file
const configContent = `window.API_URL = "${apiUrl}";`;
fs.writeFileSync("config-generated.js", configContent);

// Start the frontend server using live-server
console.log(`Starting live-server with API_URL: ${apiUrl}`);
exec("npx live-server --port=8080", (error, stdout, stderr) => {
  if (error) {
    console.error(`Error starting server: ${error.message}`);
    return;
  }
  console.log(stdout);
  console.error(stderr);
});
