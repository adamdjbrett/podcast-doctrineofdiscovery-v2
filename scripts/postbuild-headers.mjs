import fs from "node:fs";
import path from "node:path";
import { ROOT, SITE_URL } from "./site-data.mjs";

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

fs.writeFileSync(output, `${lines.join("\n")}\n`);
console.log(`Generated _headers with ${Math.floor(lines.length / 2)} canonical Link headers`);
