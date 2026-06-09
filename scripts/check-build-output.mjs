import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE_DIR = path.join(ROOT, "_site");

const requiredFiles = [
  "index.html",
  "season1/episode-0/index.html",
  "season5/episode-08/index.html",
  "episodes/index.html",
  "subscribe/index.html",
  "search/index.html",
  "rss.xml",
  "feed.xml",
  "podcast.xml",
  "sitemap.xml",
  "redirects.json",
  "assets/citations/episode-08.ris",
  "assets/citations/episode-08.csl.json",
];

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(SITE_DIR, file)));

if (missing.length) {
  console.error("Missing required build outputs:");
  for (const file of missing) {
    console.error(`- _site/${file}`);
  }
  process.exit(1);
}

const fileCount = countFiles(SITE_DIR);
if (fileCount < 450) {
  console.error(`Build output looks too small: ${fileCount} files`);
  process.exit(1);
}

console.log(`Build output check passed (${fileCount} files).`);

function countFiles(dir) {
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += countFiles(fullPath);
    } else {
      count += 1;
    }
  }
  return count;
}
