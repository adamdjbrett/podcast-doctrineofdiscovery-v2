import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./site-data.mjs";

const siteDir = path.join(ROOT, "_site");
const expected = [
  "tag/index.html",
  "tag.html",
  "categories.html",
  "pages/thank-you/index.html",
  "season1/episode-03.html",
  "special/episode-01/index.html",
  "special/episode-06/index.html",
  "assets/pdfs/NICWA_ICWA-Decision-Day-Statement-FINAL.PDF",
];
const failures = [];

for (const file of expected) {
  const fullPath = path.join(siteDir, file);
  if (!fs.existsSync(fullPath)) {
    failures.push(`Missing redirect output ${file}`);
    continue;
  }
  const text = fs.readFileSync(fullPath, "utf8");
  if (!/http-equiv="refresh"|canonical/.test(text)) {
    failures.push(`Redirect output ${file} lacks redirect markup`);
  }
}

for (const file of ["tags/index.html", "tags/haudenosaunee/index.html", "categories/index.html", "thank-you/index.html"]) {
  if (!fs.existsSync(path.join(siteDir, file))) {
    failures.push(`Missing canonical output ${file}`);
  }
}

if (failures.length) {
  console.error("Redirect/tag checks failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Redirect and tag checks passed.");
