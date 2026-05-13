/**
 * Production entry for static `dist/` (Coolify / Nixpacks runs `npm start`).
 * Uses PORT from the platform (defaults to 3000). Binds all interfaces.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = String(process.env.PORT || "3000");
const servePath = path.join(root, "node_modules", "serve", "build", "main.js");
const args = [servePath, "dist", "-n", "-p", port];

const child = spawn(process.execPath, args, { stdio: "inherit", cwd: root, env: process.env });
child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
