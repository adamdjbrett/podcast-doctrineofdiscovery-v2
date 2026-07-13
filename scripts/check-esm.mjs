import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./site-data.mjs";

const allowed = new Set(["package-lock.json"]);
const patterns = [/require\s*\(/, /module\.exports/, /createRequire/, /\.cjs\b/];
const failures = [];

for (const file of walk(ROOT)) {
  const rel = path.relative(ROOT, file);
  if (rel === "scripts/check-esm.mjs" || rel.startsWith("node_modules/") || rel.startsWith("_site/") || rel.startsWith(".git/") || allowed.has(rel)) {
    continue;
  }
  if (!/\.(js|mjs|json)$/.test(file)) {
    continue;
  }
  const text = fs.readFileSync(file, "utf8");
  for (const pattern of patterns) {
    if (pattern.test(text)) {
      failures.push(`${rel} matched ${pattern}`);
    }
  }
}

if (failures.length) {
  console.error("CommonJS/CJS references remain:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("ESM check passed.");

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return walk(fullPath);
    }
    return [fullPath];
  });
}
