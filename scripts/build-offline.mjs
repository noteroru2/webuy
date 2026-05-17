/**
 * Build สแตติกโดยบังคับใช้ข้อมูล local เท่านั้น (ไม่เรียก WordPress)
 */
import fs from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const flagFile = path.join(root, ".wp-offline");
const isWin = process.platform === "win32";
const cmd = isWin ? "npm.cmd" : "npm";

await fs.writeFile(flagFile, "1", "utf8");

const child = spawn(cmd, ["run", "build"], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, WP_OFFLINE: "1" },
  shell: isWin,
});

child.on("exit", async (code) => {
  try {
    await fs.unlink(flagFile);
  } catch {
    /* ignore */
  }
  process.exit(code ?? 1);
});
