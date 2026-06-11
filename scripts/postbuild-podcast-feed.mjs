import fs from "node:fs";
import path from "node:path";
import { PODCASTING_2_0, op3Url } from "./podcasting-data.mjs";
import { ROOT } from "./site-data.mjs";

const SOURCE_FEED_URL = "https://feeds.buzzsprout.com/1926214.rss";
const SITE_URL = "https://podcast.doctrineofdiscovery.org";
const OUTPUT_FILENAME = "podcast.xml";
const ITEM_IMAGE_URL = `${SITE_URL}/assets/img/mapping-doctrine-of-discovery-favicon.png`;
const XSL_HREF_PATH = "/assets/xsl/podcast-feed.xsl";
const CACHE_DIR = path.join(ROOT, "scripts", "cache");
const CACHE_FILE = path.join(CACHE_DIR, "buzzsprout-feed.xml");

function xmlEscape(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tagText(xml, tagName) {
  const escapedTagName = tagName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = xml.match(new RegExp(`<${escapedTagName}\\b[^>]*>([\\s\\S]*?)<\\/${escapedTagName}>`));
  return match ? match[1].replace(/^<!\[CDATA\[|\]\]>$/g, "").trim() : "";
}

function attrValue(tag, attrName) {
  const match = tag.match(new RegExp(`${attrName}=["']([^"']*)["']`));
  return match ? match[1] : "";
}

function prefixEnclosures(xml) {
  return xml.replace(/<enclosure\b([^>]*?)url=["']([^"']+)["']([^>]*)\/>/g, (match, before, url, after) => {
    return `<enclosure${before}url="${op3Url(url)}"${after}/>`;
  });
}

function isEpisodeZero(item) {
  return (
    /<guid\b[^>]*>Buzzsprout-10062173<\/guid>/.test(item) ||
    (/<itunes:episode>\s*0\s*<\/itunes:episode>/.test(item) && /<itunes:season>\s*1\s*<\/itunes:season>/.test(item))
  );
}

function markTrailerEpisode(item) {
  if (/<itunes:episodeType>/.test(item)) {
    return item.replace(/<itunes:episodeType>[\s\S]*?<\/itunes:episodeType>/, "<itunes:episodeType>trailer</itunes:episodeType>");
  }
  return item.replace(/<\/item>/, "<itunes:episodeType>trailer</itunes:episodeType></item>");
}

function trailerFromItem(item) {
  const enclosure = item.match(/<enclosure\b[^>]*\/>/)?.[0] || "";
  if (!enclosure) {
    return "";
  }

  const title = tagText(item, "itunes:title") || tagText(item, "title");
  const pubdate = tagText(item, "pubDate");
  const url = attrValue(enclosure, "url");
  const length = attrValue(enclosure, "length");
  const type = attrValue(enclosure, "type");

  return [
    `<podcast:trailer url="${xmlEscape(url)}" pubdate="${xmlEscape(pubdate)}"`,
    length ? ` length="${xmlEscape(length)}"` : "",
    type ? ` type="${xmlEscape(type)}"` : "",
    `>${xmlEscape(title)}</podcast:trailer>`,
  ].join("");
}

function podrollXml() {
  return [
    "<podcast:podroll>",
    `<podcast:remoteItem feedGuid="${PODCASTING_2_0.guid}" feedUrl="${PODCASTING_2_0.feedUrl}" title="${xmlEscape(PODCASTING_2_0.title)}"/>`,
    "</podcast:podroll>",
  ].join("\n");
}

function insertBeforeFirstItem(xml, block) {
  return xml.replace(/(\s*<item\b)/, `\n${block}\n$1`);
}

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
  let trailer = "";

  output = output.replace(/<rss\b([^>]*)>/, (match, attrs) => {
    const nextAttrs = [
      attrs,
      /xmlns:media=/.test(attrs) ? "" : ' xmlns:media="http://search.yahoo.com/mrss/"',
      /xmlns:podcast=/.test(attrs) ? "" : ' xmlns:podcast="https://podcastindex.org/namespace/1.0"',
    ].join("");
    return `<rss${nextAttrs}>`;
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
    const itemWithPrefixedEnclosures = prefixEnclosures(item);
    const itemWithEpisodeType = isEpisodeZero(itemWithPrefixedEnclosures)
      ? markTrailerEpisode(itemWithPrefixedEnclosures)
      : itemWithPrefixedEnclosures;

    if (isEpisodeZero(itemWithEpisodeType)) {
      trailer = trailerFromItem(itemWithEpisodeType);
    }

    const withoutImages = itemWithEpisodeType
      .replace(/\s*<itunes:image\b[^>]*\/>\s*/g, "")
      .replace(/\s*<media:thumbnail\b[^>]*\/>\s*/g, "");
    return withoutImages.replace(
      /<\/item>/,
      `<itunes:image href="${ITEM_IMAGE_URL}"/><media:thumbnail url="${ITEM_IMAGE_URL}"/></item>`
    );
  });

  if (trailer && !/<podcast:trailer\b/.test(output)) {
    output = insertBeforeFirstItem(output, trailer);
  }

  if (!/<podcast:podroll\b/.test(output)) {
    output = insertBeforeFirstItem(output, podrollXml());
  }

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
