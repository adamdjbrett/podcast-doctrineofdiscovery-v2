import fs from "node:fs";
import path from "node:path";
import { ROOT, SITE_URL } from "./site-data.mjs";

const headersPath = path.join(ROOT, "_site", "_headers");
const maxRules = 5;
const failures = [];

if (!fs.existsSync(headersPath)) {
  failures.push("_site/_headers is missing");
} else {
  const text = fs.readFileSync(headersPath, "utf8");
  const lines = text.split(/\r?\n/).filter(Boolean);
  const rules = lines.filter((line) => !line.startsWith(" ") && !line.startsWith("\t"));

  if (rules.length > maxRules) {
    failures.push(`_site/_headers has ${rules.length} rules; expected ${maxRules} or fewer`);
  }

  if (!text.includes(`/*.xml\n  Link: <${SITE_URL}/:splat.xml>; rel="canonical"`)) {
    failures.push("_site/_headers missing wildcard canonical Link rule for XML feeds");
  }

  for (const forbiddenPrefix of ["/assets/pdfs/", "/assets/citations/"]) {
    if (rules.some((rule) => rule.startsWith(forbiddenPrefix))) {
      failures.push(`_site/_headers contains per-file ${forbiddenPrefix} rules`);
    }
  }

  if (!text.includes("/*/metadata.json\n  Content-Type: application/ld+json")) {
    failures.push("_site/_headers missing wildcard Content-Type rule for episode metadata JSON");
  }

  const episodeRules = rules.filter((rule) => /^\/[^/]+\/\*$/.test(rule));
  if (episodeRules.length === 0) {
    failures.push("_site/_headers missing episode wildcard rules");
  }

  if (!rules.includes("/season:season/*")) {
    failures.push("_site/_headers missing shared season wildcard rule");
  }

  if (rules.some((rule) => /\/metadata\.json$/.test(rule) && rule !== "/*/metadata.json")) {
    failures.push("_site/_headers contains per-episode metadata rules");
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
