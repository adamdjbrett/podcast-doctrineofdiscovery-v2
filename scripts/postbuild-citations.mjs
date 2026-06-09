import fs from "node:fs";
import path from "node:path";
import { ROOT, readPosts } from "./site-data.mjs";

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

function oneLine(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function cslPerson(person) {
  return { literal: person.name };
}

function risFor(post) {
  const description = oneLine(post.description || post.excerpt || "");
  const lines = [
    "TY  - SOUND",
    `TI  - ${post.title}`,
    "T2  - Mapping the Doctrine of Discovery Podcast",
    ...post.creators.map((person) => `AU  - ${person.name}`),
    ...post.contributors.map((person) => `A2  - ${person.name}`),
    `DA  - ${formatDate(post.date)}`,
    `PY  - ${new Date(post.date).getUTCFullYear()}`,
    `UR  - https://podcast.doctrineofdiscovery.org${post.url}`,
    "LA  - en",
    "M3  - Podcast episode",
    "PB  - Indigenous Values Initiative",
  ];
  if (description) {
    lines.push(`AB  - ${description}`);
  }
  for (const tag of post.tags || []) {
    lines.push(`KW  - ${tag}`);
  }
  lines.push(`N1  - ${post.rights.text} ${post.rights.url}`);
  lines.push(`T1  - ${post.title}`);
  lines.push("ER  -");
  return `${lines.join("\n")}\n`;
}

function cslFor(post) {
  const d = new Date(post.date);
  const obj = {
    id: post.slug,
    type: "broadcast",
    genre: "Podcast episode",
    title: post.title,
    "container-title": "Mapping the Doctrine of Discovery Podcast",
    author: post.creators.map(cslPerson),
    contributor: post.contributors.map(cslPerson),
    publisher: post.publisher.name,
    abstract: oneLine(post.description || post.excerpt || ""),
    URL: `https://podcast.doctrineofdiscovery.org${post.url}`,
    language: post.language,
    source: "Mapping the Doctrine of Discovery Podcast",
    license: post.rights.url,
    issued: {
      "date-parts": [[d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()]],
    },
  };
  if (post.duration) {
    obj.dimensions = post.duration;
  }
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
