// Generates _site/_headers for Cloudflare Workers Assets.
//
// Signposting links are emitted as a single comma-separated Link field per rule
// (RFC 8288 allows multiple link-values in one field, and Cloudflare coalesces
// them that way on the wire regardless) so each rule carries one header entry
// instead of three.
//
// The trailing `/*metadata.json` rule is deliberately last: rules apply in file
// order, so its `! Link` unsets the episode Signposting links that would
// otherwise be attached to the JSON-LD documents themselves — where the
// describedby target resolved to a bogus `.../metadata.jsonmetadata.json`.

import fs from "node:fs/promises";
import path from "node:path";
import { ROOT, SITE_URL } from "./site-data.mjs";
import { loadPosts } from "./site-data-cache.mjs";

const output = path.join(ROOT, "_site", "_headers");
const posts = loadPosts();

const episodeCategories = [...new Set(posts.map((post) => post.url.split("/").filter(Boolean)[0]).filter(Boolean))].sort();
const seasonCategories = episodeCategories.filter((category) => /^season\d+$/.test(category));
const standaloneCategories = episodeCategories.filter((category) => !/^season\d+$/.test(category));

// All seasons share one rule via the :season placeholder.
const episodePrefixes = [...(seasonCategories.length ? ["/season:season"] : []), ...standaloneCategories.map((category) => `/${category}`)];

function signpostingLink(prefix) {
  return [
    `<${SITE_URL}${prefix}/:splatmetadata.json>; rel="describedby"; type="application/ld+json"; profile="https://schema.org/"`,
    `<${SITE_URL}${prefix}/:splat>; rel="cite-as"`,
    `<https://schema.org/PodcastEpisode>; rel="type"`,
  ].join(", ");
}

const rules = [
  ["/*.xml", [`Link: <${SITE_URL}/:splat.xml>; rel="canonical"`]],
  ...episodePrefixes.map((prefix) => [`${prefix}/*`, [`Link: ${signpostingLink(prefix)}`]]),
  ["/*metadata.json", ["Content-Type: application/ld+json", "! Link"]],
];

const headers = rules.map(([match, lines]) => [match, ...lines.map((line) => `  ${line}`)].join("\n")).join("\n");

await fs.writeFile(output, `${headers}\n`);
console.log(`Generated _headers with ${rules.length} wildcard rules for ${posts.length} posts`);
