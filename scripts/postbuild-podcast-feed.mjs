import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./site-data.mjs";

const SOURCE_FEED_URL = "https://feeds.buzzsprout.com/1926214.rss";
const SITE_URL = "https://podcast.doctrineofdiscovery.org";
const OUTPUT_FILENAME = "podcast.xml";
const ITEM_IMAGE_URL = `${SITE_URL}/assets/img/mapping-doctrine-of-discovery-favicon.png`;
const XSL_HREF_PATH = "/assets/xsl/podcast-feed.xsl";
const CACHE_DIR = path.join(ROOT, "scripts", "cache");
const CACHE_FILE = path.join(CACHE_DIR, "buzzsprout-feed.xml");

async function fetchFeed(url, redirects = 5) {
  if (redirects <= 0) {
    throw new Error("Too many redirects while fetching source feed");
  }
  const response = await fetch(url, {
    headers: { "User-Agent": "EleventyPodcastFeedGenerator/1.0" },
  });
  if ([301, 302, 303, 307, 308].includes(response.status)) {
    const location = response.headers.get("location");
    if (!location) {
      throw new Error(`Redirect response missing Location header from ${url}`);
    }
    return fetchFeed(new URL(location, url).toString(), redirects - 1);
  }
  if (!response.ok) {
    throw new Error(`Unable to fetch source feed (${response.status} ${response.statusText}) from ${SOURCE_FEED_URL}`);
  }
  return response.text();
}

function transformFeed(xml) {
  let output = xml.replace(/^\s*<\?xml-stylesheet .*?\?>\s*/m, "");

  output = output.replace(/<rss\b([^>]*)>/, (match, attrs) => {
    if (/xmlns:media=/.test(attrs)) {
      return match;
    }
    return `<rss${attrs} xmlns:media="http://search.yahoo.com/mrss/">`;
  });

  output = output.replace(
    /<atom:link\b[^>]*rel=["']self["'][^>]*\/>\s*/g,
    ""
  );
  output = output.replace(
    /(<channel\b[^>]*>)/,
    `$1\n<atom:link href="${SITE_URL}/${OUTPUT_FILENAME}" rel="self" type="application/rss+xml"/>`
  );

  output = output.replace(/<item\b[\s\S]*?<\/item>/g, (item) => {
    const withoutImages = item
      .replace(/\s*<itunes:image\b[^>]*\/>\s*/g, "")
      .replace(/\s*<media:thumbnail\b[^>]*\/>\s*/g, "");
    return withoutImages.replace(
      /<\/item>/,
      `<itunes:image href="${ITEM_IMAGE_URL}"/><media:thumbnail url="${ITEM_IMAGE_URL}"/></item>`
    );
  });

  if (/^\s*<\?xml/.test(output)) {
    output = output.replace(
      /^\s*(<\?xml[^>]*\?>)\s*/,
      `$1\n<?xml-stylesheet href="${XSL_HREF_PATH}" type="text/xsl"?>\n`
    );
  } else {
    output = `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet href="${XSL_HREF_PATH}" type="text/xsl"?>\n${output}`;
  }

  return `${output.trim()}\n`;
}

let sourceXml;
try {
  sourceXml = await fetchFeed(SOURCE_FEED_URL);
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(CACHE_FILE, sourceXml);
} catch (error) {
  if (!fs.existsSync(CACHE_FILE)) {
    throw error;
  }
  console.warn(`Using cached podcast feed after fetch failed: ${error.message}`);
  sourceXml = fs.readFileSync(CACHE_FILE, "utf8");
}
const output = transformFeed(sourceXml);
fs.writeFileSync(path.join(ROOT, "_site", OUTPUT_FILENAME), output);
console.log(`Generated ${OUTPUT_FILENAME} from ${SOURCE_FEED_URL}`);
