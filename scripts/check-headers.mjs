import fs from "node:fs";
import path from "node:path";
import { ROOT, SITE_URL } from "./site-data.mjs";

const headersPath = path.join(ROOT, "_site", "_headers");
const maxRules = 5;
// One Link entry per rule: the Signposting link-values are comma-joined into a
// single field rather than repeated across three header lines.
const maxHeaderLines = 8;
const failures = [];

if (!fs.existsSync(headersPath)) {
  failures.push("_site/_headers is missing");
} else {
  const text = fs.readFileSync(headersPath, "utf8");
  const lines = text.split(/\r?\n/).filter(Boolean);
  const rules = lines.filter((line) => !line.startsWith(" ") && !line.startsWith("\t"));
  const headerLines = lines.filter((line) => line.startsWith(" ") || line.startsWith("\t"));

  if (rules.length > maxRules) {
    failures.push(`_site/_headers has ${rules.length} rules; expected ${maxRules} or fewer`);
  }

  if (headerLines.length > maxHeaderLines) {
    failures.push(`_site/_headers has ${headerLines.length} header entries; expected ${maxHeaderLines} or fewer`);
  }

  if (!text.includes(`/*.xml\n  Link: <${SITE_URL}/:splat.xml>; rel="canonical"`)) {
    failures.push("_site/_headers missing wildcard canonical Link rule for XML feeds");
  }

  for (const forbiddenPrefix of ["/assets/pdfs/", "/assets/citations/"]) {
    if (rules.some((rule) => rule.startsWith(forbiddenPrefix))) {
      failures.push(`_site/_headers contains per-file ${forbiddenPrefix} rules`);
    }
  }

  if (!text.includes("/*metadata.json\n  Content-Type: application/ld+json")) {
    failures.push("_site/_headers missing wildcard Content-Type rule for episode metadata JSON");
  }

  // Must come last so it can unset the episode Signposting links, which would
  // otherwise point describedby at `.../metadata.jsonmetadata.json`.
  if (rules.at(-1) !== "/*metadata.json" || !text.includes("/*metadata.json\n  Content-Type: application/ld+json\n  ! Link")) {
    failures.push("_site/_headers must end with the /*metadata.json rule that unsets Link");
  }

  const episodeRules = rules.filter((rule) => /^\/[^/]+\/\*$/.test(rule));
  if (episodeRules.length === 0) {
    failures.push("_site/_headers missing episode wildcard rules");
  }

  if (!rules.includes("/season:season/*")) {
    failures.push("_site/_headers missing shared season wildcard rule");
  }

  for (const rule of episodeRules) {
    const prefix = rule.slice(0, -2);
    const expected = `${rule}\n  Link: <${SITE_URL}${prefix}/:splatmetadata.json>; rel="describedby"; type="application/ld+json"; profile="https://schema.org/", <${SITE_URL}${prefix}/:splat>; rel="cite-as", <https://schema.org/PodcastEpisode>; rel="type"`;
    if (!text.includes(expected)) {
      failures.push(`_site/_headers rule ${rule} is missing the combined Signposting Link entry`);
    }
  }

  if (rules.some((rule) => /\/metadata\.json$/.test(rule) && rule !== "/*metadata.json")) {
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
