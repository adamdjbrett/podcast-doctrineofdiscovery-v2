import fs from "node:fs";
import path from "node:path";
import { ROOT, readPosts, slugify } from "./site-data.mjs";

const siteDir = path.join(ROOT, "_site");
const dcNames = ["title", "creator", "subject", "description", "publisher", "contributor", "date", "type", "format", "identifier", "source", "language", "relation", "coverage", "rights"];
const failures = [];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return walk(fullPath);
    }
    return entry.isFile() && entry.name.endsWith(".html") ? [fullPath] : [];
  });
}

function jsonLdBlocks(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g)].map((match) => {
    try {
      return JSON.parse(match[1]);
    } catch (error) {
      failures.push(`Invalid JSON-LD: ${error.message}`);
      return {};
    }
  });
}

function graphTypes(blocks) {
  return new Set(
    blocks.flatMap((block) => {
      const graph = Array.isArray(block["@graph"]) ? block["@graph"] : [block];
      return graph.map((node) => node["@type"]).filter(Boolean);
    })
  );
}

function isRedirectPage(html) {
  return html.includes("<title>Redirecting...</title>") && html.includes("http-equiv=\"refresh\"");
}

for (const post of readPosts()) {
  const htmlPath = path.join(siteDir, post.url.replace(/^\//, ""), "index.html");
  const html = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, "utf8") : "";
  if (!html) {
    failures.push(`Missing episode HTML ${post.url}`);
    continue;
  }
  for (const name of dcNames) {
    if (!html.includes(`name="DC.${name}"`)) {
      failures.push(`${post.url} missing DC.${name}`);
    }
  }
  if (!html.includes("class=\"h-entry\"") && !html.includes("class=\"h-entry ")) {
    failures.push(`${post.url} missing h-entry`);
  }
  const types = graphTypes(jsonLdBlocks(html));
  for (const type of ["WebPage", "PodcastSeries", "PodcastEpisode", "BreadcrumbList"]) {
    if (!types.has(type)) {
      failures.push(`${post.url} missing JSON-LD ${type}`);
    }
  }
  for (const tag of post.tags) {
    const tagPath = path.join(siteDir, "tags", slugify(tag), "index.html");
    if (!fs.existsSync(tagPath)) {
      failures.push(`Missing tag page for ${tag}`);
    }
  }
}

const hcardPages = ["index.html", "authors/adamdjbrett/index.html"];
for (const file of hcardPages) {
  const html = fs.readFileSync(path.join(siteDir, file), "utf8");
  if (!html.includes("h-card")) {
    failures.push(`${file} missing h-card`);
  }
}

for (const htmlPath of walk(siteDir)) {
  const html = fs.readFileSync(htmlPath, "utf8");
  if (isRedirectPage(html)) {
    continue;
  }
  const relPath = path.relative(siteDir, htmlPath);
  const types = graphTypes(jsonLdBlocks(html));
  for (const type of ["WebPage", "PodcastSeries", "BreadcrumbList"]) {
    if (!types.has(type)) {
      failures.push(`${relPath} missing JSON-LD ${type}`);
    }
  }
}

if (failures.length) {
  console.error("Metadata checks failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Metadata checks passed.");
