import fs from "node:fs";
import path from "node:path";
import { ROOT, SITE_URL, readPosts } from "./site-data.mjs";

const siteDir = path.join(ROOT, "_site");
const output = path.join(siteDir, "_headers");
const lines = [
  "/rss.xml",
  `  Link: <${SITE_URL}/rss.xml>; rel=\"canonical\"`,
  "/feed.xml",
  `  Link: <${SITE_URL}/feed.xml>; rel=\"canonical\"`,
  "/podcast.xml",
  `  Link: <${SITE_URL}/podcast.xml>; rel=\"canonical\"`,
];

for (const post of readPosts()) {
  const pageUrl = `${SITE_URL}${post.url}`;
  const metadataUrl = `${pageUrl}metadata.json`;
  lines.push(
    post.url,
    `  Link: <${metadataUrl}>; rel=\"describedby\"; type=\"application/ld+json\"; profile=\"https://schema.org/\"`,
    `  Link: <${pageUrl}>; rel=\"cite-as\"`,
    `  Link: <https://schema.org/PodcastEpisode>; rel=\"type\"`,
    `${post.url}metadata.json`,
    `  Content-Type: application/ld+json`
  );
}

fs.writeFileSync(output, `${lines.join("\n")}\n`);
console.log(`Generated _headers with ${Math.floor(lines.length / 2)} canonical Link headers`);
