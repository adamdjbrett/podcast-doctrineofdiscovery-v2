import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { ROOT, readPosts } = require("./site-data.cjs");

const outputDir = path.join(ROOT, "_site", "assets", "citations");
fs.mkdirSync(outputDir, { recursive: true });

const posts = readPosts();

function formatDate(date) {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

function risFor(post) {
  const lines = [
    "TY  - GEN",
    `TI  - ${post.title}`,
    `DA  - ${formatDate(post.date)}`,
    `UR  - https://podcast.doctrineofdiscovery.org${post.url}`,
  ];
  const description = post.description || post.excerpt || "";
  if (description) {
    lines.push(`N1  - ${String(description).replace(/\n/g, " ")}`);
  }
  for (const tag of post.tags || []) {
    lines.push(`KW  - ${tag}`);
  }
  lines.push("PB  - Mapping the Doctrine of Discovery Podcast");
  lines.push(`T1  - ${post.title}`);
  lines.push("ER  -");
  return `${lines.join("\n")}\n`;
}

function cslFor(post) {
  const d = new Date(post.date);
  const obj = {
    id: post.slug,
    type: "broadcast",
    title: post.title,
    abstract: String(post.description || post.excerpt || "").replace(/\n/g, " "),
    URL: `https://podcast.doctrineofdiscovery.org${post.url}`,
    language: "en",
    source: "Mapping the Doctrine of Discovery Podcast",
    issued: {
      "date-parts": [[d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()]],
    },
  };
  if (post.tags?.length) {
    obj.keyword = post.tags;
  }
  return `${JSON.stringify([obj], null, 2)}\n`;
}

function legacyDateSlug(post) {
  return path.basename(post.inputPath, path.extname(post.inputPath));
}

for (const post of posts) {
  const slugs = new Set([post.slug, legacyDateSlug(post)]);
  for (const slug of slugs) {
    fs.writeFileSync(path.join(outputDir, `${slug}.ris`), risFor(post));
    fs.writeFileSync(path.join(outputDir, `${slug}.csl.json`), cslFor(post));
  }
}

console.log(`Generated citation files for ${posts.length} posts`);
