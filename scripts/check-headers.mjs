import fs from "node:fs";
import path from "node:path";
import { ROOT, SITE_URL } from "./site-data.mjs";

const headersPath = path.join(ROOT, "_site", "_headers");
const maxRules = 100;
const requiredRules = [
  ["/rss.xml", `Link: <${SITE_URL}/rss.xml>; rel="canonical"`],
  ["/feed.xml", `Link: <${SITE_URL}/feed.xml>; rel="canonical"`],
  ["/podcast.xml", `Link: <${SITE_URL}/podcast.xml>; rel="canonical"`],
];
const failures = [];

if (!fs.existsSync(headersPath)) {
  failures.push("_site/_headers is missing");
} else {
  const text = fs.readFileSync(headersPath, "utf8");
  const lines = text.split(/\r?\n/).filter(Boolean);
  const rules = lines.filter((line) => !line.startsWith(" ") && !line.startsWith("\t"));

  if (rules.length > maxRules) {
    failures.push(`_site/_headers has ${rules.length} rules; Cloudflare Workers allows at most ${maxRules}`);
  }

  for (const [pathRule, header] of requiredRules) {
    if (!text.includes(`${pathRule}\n  ${header}`)) {
      failures.push(`_site/_headers missing canonical Link rule for ${pathRule}`);
    }
  }

  for (const forbiddenPrefix of ["/assets/pdfs/", "/assets/citations/"]) {
    if (rules.some((rule) => rule.startsWith(forbiddenPrefix))) {
      failures.push(`_site/_headers contains per-file ${forbiddenPrefix} rules`);
    }
  }
}

if (failures.length) {
  console.error("Header checks failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Header checks passed.");
