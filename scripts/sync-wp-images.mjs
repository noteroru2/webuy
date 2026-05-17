/**
 * @deprecated ใช้ npm run sync:wp แทน — คงไว้เพื่อ backward compatibility
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const isWin = process.platform === "win32";
const cmd = isWin ? "node.exe" : "node";
const child = spawn(cmd, ["scripts/sync-wp-all.mjs", ...process.argv.slice(2)], {
  cwd: root,
  stdio: "inherit",
  shell: false,
});
child.on("exit", (code) => process.exit(code ?? 1));
