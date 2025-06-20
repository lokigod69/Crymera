// safeKillPort.js
const { execSync } = require("child_process");

try {
  const output = execSync("netstat -ano | findstr :9009").toString();
  const lines = output.trim().split("\n");

  lines.forEach(line => {
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (!isNaN(pid)) {
      try {
        execSync(`taskkill /F /PID ${pid}`);
        console.log(`Killed process on port 9009 with PID ${pid}`);
      } catch (err) {
        console.error(`Failed to kill PID ${pid}:`, err.message);
      }
    }
  });
} catch {
  console.log("Nothing on port 9009. No need to kill.");
}
