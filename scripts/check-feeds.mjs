import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE_DIR = path.join(ROOT, "_site");

const checks = [
  {
    file: "rss.xml",
    patterns: [/<rss\b/, /<channel>/, /<item>/, /<atom:link\b/],
  },
  {
    file: "feed.xml",
    patterns: [/<feed\b[^>]*xmlns="http:\/\/www\.w3\.org\/2005\/Atom"/, /<entry>/, /<updated>/],
  },
  {
    file: "sitemap.xml",
    patterns: [/<urlset\b/, /<loc>https:\/\/podcast\.doctrineofdiscovery\.org\/<\/loc>/],
  },
  {
    file: "podcast.xml",
    patterns: [
      /<rss\b/,
      /xmlns:media="http:\/\/search\.yahoo\.com\/mrss\/"/,
      /<atom:link href="https:\/\/podcast\.doctrineofdiscovery\.org\/podcast\.xml" rel="self" type="application\/rss\+xml"\/>/,
      /<itunes:image href="https:\/\/podcast\.doctrineofdiscovery\.org\/assets\/img\/mapping-doctrine-of-discovery-favicon\.png"\/>/,
      /<media:thumbnail url="https:\/\/podcast\.doctrineofdiscovery\.org\/assets\/img\/mapping-doctrine-of-discovery-favicon\.png"\/>/,
    ],
  },
];

const failures = [];

for (const check of checks) {
  const filePath = path.join(SITE_DIR, check.file);
  if (!fs.existsSync(filePath)) {
    failures.push(`_site/${check.file} is missing`);
    continue;
  }
  const xml = fs.readFileSync(filePath, "utf8");
  for (const pattern of check.patterns) {
    if (!pattern.test(xml)) {
      failures.push(`_site/${check.file} failed pattern ${pattern}`);
    }
  }
}

if (failures.length) {
  console.error("Feed checks failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Feed checks passed.");
