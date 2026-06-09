import fs from "node:fs";
import path from "node:path";
import { ROOT, readPosts, slugify } from "./site-data.mjs";

const siteDir = path.join(ROOT, "_site");
const dcNames = ["title", "creator", "subject", "description", "publisher", "contributor", "date", "type", "format", "identifier", "source", "language", "relation", "coverage", "rights"];
const failures = [];

for (const post of readPosts()) {
  const htmlPath = path.join(siteDir, post.url.replace(/^\//, ""), "index.html");
  const html = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, "utf8") : "";
  if (!html) {
    failures.push(`Missing episode HTML ${post.url}`);
    continue;
  }
  for (const name of dcNames) {
    if (!html.includes(`name="DC.${name}"`)) {
      failures.push(`${post.url} missing DC.${name}`);
    }
  }
  if (!html.includes("class=\"h-entry\"") && !html.includes("class=\"h-entry ")) {
    failures.push(`${post.url} missing h-entry`);
  }
  for (const tag of post.tags) {
    const tagPath = path.join(siteDir, "tags", slugify(tag), "index.html");
    if (!fs.existsSync(tagPath)) {
      failures.push(`Missing tag page for ${tag}`);
    }
  }
}

const hcardPages = ["index.html", "authors/adamdjbrett/index.html"];
for (const file of hcardPages) {
  const html = fs.readFileSync(path.join(siteDir, file), "utf8");
  if (!html.includes("h-card")) {
    failures.push(`${file} missing h-card`);
  }
}

if (failures.length) {
  console.error("Metadata checks failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Metadata checks passed.");
