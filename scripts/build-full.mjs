/**
 * Build สแตติกครบทุก slug (ไม่จำกัด FAST_BUILD_LIMIT)
 * เนื้อหาอ่านจาก src/generated/wp-data/ ใน repo — ไม่เรียก CMS
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(root, ".env") });
dotenv.config({ path: path.join(root, ".env.local") });
dotenv.config({ path: path.join(root, ".env.production") });
delete process.env.FAST_BUILD_LIMIT;

const isWin = process.platform === "win32";
const cmd = isWin ? "npm.cmd" : "npm";
const child = spawn(cmd, ["run", "build"], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env },
  shell: isWin,
});
child.on("exit", (code) => process.exit(code ?? 1));
