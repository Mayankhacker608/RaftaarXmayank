import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const services = [
  {
    name: "backend",
    cwd: path.join(root, "backend"),
    command: "npm",
    args: ["run", "dev"],
  },
  {
    name: "frontend",
    cwd: path.join(root, "frontend"),
    command: "npm",
    args: ["run", "dev"],
  },
];

const children = services.map((service) => {
  const child = spawn(service.command, service.args, {
    cwd: service.cwd,
    shell: true,
    stdio: "inherit",
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`${service.name} exited with code ${code}`);
      shutdown(code);
    }
  });

  return child;
});

let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }

  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
