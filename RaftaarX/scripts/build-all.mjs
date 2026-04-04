import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const steps = [
  {
    label: "backend install",
    cwd: path.join(root, "backend"),
    command: "npm",
    args: ["install"],
  },
  {
    label: "frontend install",
    cwd: path.join(root, "frontend"),
    command: "npm",
    args: ["install"],
  },
  {
    label: "frontend build",
    cwd: path.join(root, "frontend"),
    command: "npm",
    args: ["run", "build"],
  },
];

for (const step of steps) {
  await new Promise((resolve, reject) => {
    const child = spawn(step.command, step.args, {
      cwd: step.cwd,
      shell: true,
      stdio: "inherit",
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${step.label} failed with code ${code}`));
    });
  });
}
