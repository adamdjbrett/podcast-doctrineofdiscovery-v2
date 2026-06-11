import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PODCASTING_2_0 } from "./podcasting-data.mjs";
import { readPosts } from "./site-data.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE_DIR = path.join(ROOT, "_site");

function buzzsproutIdFromPost(post) {
  const match = String(post.rawContent || "").match(/buzzsprout\.com\/1926214\/(?:episodes\/)?(\d+)/);
  return match ? match[1] : "";
}

function itemForBuzzsproutId(xml, id) {
  return [...xml.matchAll(/<item\b[\s\S]*?<\/item>/g)]
    .map((match) => match[0])
    .find((item) => item.includes(`Buzzsprout-${id}`) || new RegExp(`buzzsprout\\.com/1926214/(?:episodes/)?${id}`).test(item)) || "";
}

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
      /xmlns:podcast="https:\/\/podcastindex\.org\/namespace\/1\.0"/,
      /<atom:link href="https:\/\/podcast\.doctrineofdiscovery\.org\/podcast\.xml" rel="self" type="application\/rss\+xml"\/>/,
      /<podcast:guid>34631f7b-6950-5c4b-9a96-950b741828c5<\/podcast:guid>/,
      /<podcast:trailer\b/,
      /<itunes:episodeType>trailer<\/itunes:episodeType>/,
      /<podcast:transcript\b[^>]*type="application\/pdf"/,
      /<itunes:image href="https:\/\/podcast\.doctrineofdiscovery\.org\/assets\/img\/mapping-doctrine-of-discovery-favicon\.png"\/>/,
      /<media:thumbnail url="https:\/\/podcast\.doctrineofdiscovery\.org\/assets\/img\/mapping-doctrine-of-discovery-favicon\.png"\/>/,
    ],
    custom(xml) {
      const trailerCount = (xml.match(/<podcast:trailer\b/g) || []).length;
      if (trailerCount !== 1) {
        return [`_site/podcast.xml expected one <podcast:trailer>, found ${trailerCount}`];
      }

      const op3Enclosures = (xml.match(/<enclosure\b[^>]*url="https:\/\/op3\.dev\/e\//g) || []).length;
      if (op3Enclosures > 0) {
        return [`_site/podcast.xml contains ${op3Enclosures} OP3-prefixed enclosure URL(s), but OP3 is disabled`];
      }

      if (!xml.includes(PODCASTING_2_0.guid)) {
        return [`_site/podcast.xml is missing Podcasting 2.0 GUID ${PODCASTING_2_0.guid}`];
      }

      const failures = [];
      const episodeZero = itemForBuzzsproutId(xml, "10062173");
      if (!/<itunes:episodeType>trailer<\/itunes:episodeType>/.test(episodeZero)) {
        failures.push("_site/podcast.xml episode 0 item is missing <itunes:episodeType>trailer</itunes:episodeType>");
      }

      for (const post of readPosts()) {
        const id = buzzsproutIdFromPost(post);
        if (!id || !post.transcript_pdf) {
          continue;
        }

        const item = itemForBuzzsproutId(xml, id);
        if (!item) {
          failures.push(`_site/podcast.xml is missing Buzzsprout item ${id} for ${post.url}`);
        } else if (!/<podcast:transcript\b/.test(item)) {
          failures.push(`_site/podcast.xml item ${id} for ${post.url} is missing a <podcast:transcript> tag`);
        }
      }

      return failures;
    },
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
  if (check.custom) {
    failures.push(...check.custom(xml));
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
