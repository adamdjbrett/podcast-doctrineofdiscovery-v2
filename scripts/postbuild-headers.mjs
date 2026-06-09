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

for (const dir of ["assets/pdfs", "assets/citations"]) {
  const fullDir = path.join(siteDir, dir);
  if (!fs.existsSync(fullDir)) {
    continue;
  }
  for (const file of walk(fullDir)) {
    const rel = path.relative(siteDir, file).split(path.sep).join("/");
    lines.push(`/${rel}`);
    lines.push(`  Link: <${SITE_URL}/${encodeURI(rel)}>; rel=\"canonical\"`);
  }
}

fs.writeFileSync(output, `${lines.join("\n")}\n`);
console.log(`Generated _headers with ${Math.floor(lines.length / 2)} canonical Link headers`);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return walk(fullPath);
    }
    return [fullPath];
  });
}
