import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE_DIR = path.join(ROOT, "_site");
const LINK_RE = /\b(?:href|src)=["']([^"']+)["']/g;
const ignoredPrefixes = ["http://", "https://", "mailto:", "tel:", "#", "data:"];

const missing = new Set();

for (const file of walk(SITE_DIR).filter((entry) => entry.endsWith(".html"))) {
  const html = fs.readFileSync(file, "utf8");
  for (const match of html.matchAll(LINK_RE)) {
    const href = match[1];
    if (ignoredPrefixes.some((prefix) => href.startsWith(prefix)) || href.includes("{{")) {
      continue;
    }
    if (!href.startsWith("/")) {
      continue;
    }
    const target = href.split("#")[0].split("?")[0];
    if (!target) {
      continue;
    }
    if (!existsInSite(target)) {
      missing.add(`${path.relative(SITE_DIR, file)} -> ${href}`);
    }
  }
}

if (missing.size) {
  console.error("Missing internal links/assets in _site:");
  for (const item of [...missing].sort()) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log("Internal link check passed.");

function existsInSite(target) {
  const clean = decodeURIComponent(target).replace(/^\//, "");
  const fullPath = path.join(SITE_DIR, clean);
  if (fs.existsSync(fullPath)) {
    return true;
  }
  return fs.existsSync(path.join(fullPath, "index.html"));
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return walk(fullPath);
    }
    return [fullPath];
  });
}
