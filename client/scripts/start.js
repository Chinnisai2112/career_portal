const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const clientDir = path.join(__dirname, "..");
const nodeModules = path.join(clientDir, "node_modules");

function run(command, args, extraEnv = {}) {
  return spawn(command, args, {
    stdio: "inherit",
    shell: true,
    cwd: clientDir,
    env: { ...process.env, ...extraEnv },
  });
}

function waitForExit(child) {
  return new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0 || code === null) resolve();
      else reject(new Error(`Command exited with code ${code}`));
    });
  });
}

async function ensureDependencies() {
  if (fs.existsSync(nodeModules)) return;

  console.log("First run: installing client dependencies...\n");
  await waitForExit(run("npm", ["install"]));
}

async function main() {
  await ensureDependencies();

  const envFile = path.join(clientDir, ".env");
  const envExample = path.join(clientDir, ".env.example");
  if (!fs.existsSync(envFile) && fs.existsSync(envExample)) {
    console.log("Tip: copy client/.env.example to client/.env to customize the API URL.\n");
  }

  console.log("Career Portal — frontend");
  console.log("  App:     http://localhost:" + (process.env.PORT || "3000"));
  console.log("  API:     http://localhost:5000/api (start backend with: npm run dev)\n");

  const child = run("npx", ["react-scripts", "start"], {
    BROWSER: process.env.BROWSER || "none",
    PORT: process.env.PORT || "3000",
  });

  child.on("exit", (code) => process.exit(code ?? 0));
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
