const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const clientDir = fs.existsSync(path.join(__dirname, "client"))
  ? path.join(__dirname, "client")
  : path.join(__dirname, "../client");

if (!fs.existsSync(clientDir)) {
  console.error("Client directory not found at:", clientDir);
  process.exit(1);
}

console.log("=== Building React client at:", clientDir, "===");
execSync("npm install", { cwd: clientDir, stdio: "inherit" });
execSync("npm run build", { cwd: clientDir, stdio: "inherit" });
console.log("=== React client build finished successfully! ===");

