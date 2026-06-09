import fs from "node:fs";
import path from "node:path";
import { ROOT, readPosts } from "./site-data.mjs";

const outputDir = path.join(ROOT, "_site", "assets", "citations");
const requiredCsl = ["type", "genre", "title", "container-title", "author", "contributor", "publisher", "issued", "URL", "abstract", "language", "keyword", "license"];
const failures = [];

for (const post of readPosts()) {
  for (const slug of citationSlugs(post)) {
    const risPath = path.join(outputDir, `${slug}.ris`);
    const cslPath = path.join(outputDir, `${slug}.csl.json`);
    if (!fs.existsSync(risPath)) {
      failures.push(`Missing RIS ${slug}`);
      continue;
    }
    if (!fs.readFileSync(risPath, "utf8").trimEnd().endsWith("ER  -")) {
      failures.push(`RIS ${slug} does not end with ER`);
    }
    if (!fs.existsSync(cslPath)) {
      failures.push(`Missing CSL ${slug}`);
      continue;
    }
    const data = JSON.parse(fs.readFileSync(cslPath, "utf8"));
    const record = data[0];
    for (const key of requiredCsl) {
      if (record[key] === undefined || record[key] === "" || (Array.isArray(record[key]) && !record[key].length)) {
        failures.push(`CSL ${slug} missing ${key}`);
      }
    }
  }
}

if (failures.length) {
  console.error("Citation checks failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Citation checks passed.");

function citationSlugs(post) {
  return new Set([post.slug, path.basename(post.inputPath, path.extname(post.inputPath))]);
}
