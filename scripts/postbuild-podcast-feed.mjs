import fs from "node:fs";
import path from "node:path";
import { PODCASTING_2_0 } from "./podcasting-data.mjs";
import { ROOT, SITE_URL, readPosts } from "./site-data.mjs";

const SOURCE_FEED_URL = "https://feeds.buzzsprout.com/1926214.rss";
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

function absoluteUrl(value) {
  if (!value) {
    return "";
  }
  if (/^https?:\/\//.test(value)) {
    return value;
  }
  return `${SITE_URL}${value.startsWith("/") ? value : `/${value}`}`;
}

function buzzsproutIdFromPost(post) {
  const match = String(post.rawContent || "").match(/buzzsprout\.com\/1926214\/(?:episodes\/)?(\d+)/);
  return match ? match[1] : "";
}

function buzzsproutIdFromItem(item) {
  return (
    tagText(item, "guid").match(/^Buzzsprout-(\d+)$/)?.[1] ||
    item.match(/buzzsprout\.com\/1926214\/(?:episodes\/)?(\d+)/)?.[1] ||
    ""
  );
}

function transcriptMapFromPosts(posts) {
  return new Map(
    posts
      .map((post) => [buzzsproutIdFromPost(post), post.transcript_pdf])
      .filter(([id, transcriptPdf]) => id && transcriptPdf)
  );
}

function localTranscriptXml(transcriptPdf) {
  const url = absoluteUrl(transcriptPdf);
  return url ? `<podcast:transcript url="${xmlEscape(url)}" type="application/pdf" />` : "";
}

function addLocalTranscriptIfMissing(item, transcriptByBuzzsproutId) {
  if (/<podcast:transcript\b/.test(item)) {
    return item;
  }

  const transcriptPdf = transcriptByBuzzsproutId.get(buzzsproutIdFromItem(item));
  const transcript = localTranscriptXml(transcriptPdf);
  return transcript ? item.replace(/<\/item>/, `${transcript}</item>`) : item;
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

function insertAfterChannelOpen(xml, block) {
  return xml.replace(/(<channel\b[^>]*>)/, `$1\n${block}`);
}

function ensurePodcastGuid(xml) {
  if (/<podcast:guid\b/.test(xml)) {
    return xml.replace(/<podcast:guid\b[^>]*>[\s\S]*?<\/podcast:guid>/, `<podcast:guid>${PODCASTING_2_0.guid}</podcast:guid>`);
  }
  return insertAfterChannelOpen(xml, `<podcast:guid>${PODCASTING_2_0.guid}</podcast:guid>`);
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

function transformFeed(xml, posts = readPosts()) {
  let output = xml.replace(/^\s*<\?xml-stylesheet .*?\?>\s*/m, "");
  let trailer = "";
  const transcriptByBuzzsproutId = transcriptMapFromPosts(posts);

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
  output = ensurePodcastGuid(output);

  output = output.replace(/<item\b[\s\S]*?<\/item>/g, (item) => {
    const itemWithEpisodeType = isEpisodeZero(item) ? markTrailerEpisode(item) : item;
    const itemWithTranscript = addLocalTranscriptIfMissing(itemWithEpisodeType, transcriptByBuzzsproutId);

    if (isEpisodeZero(itemWithTranscript)) {
      trailer = trailerFromItem(itemWithTranscript);
    }

    const withoutImages = itemWithTranscript
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
