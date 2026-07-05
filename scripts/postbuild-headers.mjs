import { Environment } from "@11ty/nunjucks";
import fs from "node:fs/promises";
import path from "node:path";
import { ROOT, SITE_URL, readPosts } from "./site-data.mjs";

const siteDir = path.join(ROOT, "_site");
const output = path.join(siteDir, "_headers");
const env = new Environment(null, { autoescape: false });
const posts = await Promise.resolve(readPosts());
const episodeCategories = [...new Set(posts.map((post) => post.url.split("/").filter(Boolean)[0]).filter(Boolean))].sort();
const seasonCategories = episodeCategories.filter((category) => /^season\d+$/.test(category));
const standaloneCategories = episodeCategories.filter((category) => !/^season\d+$/.test(category));
const template = `/*.xml
  Link: <{{ siteUrl }}/:splat.xml>; rel="canonical"
/*/metadata.json
  Content-Type: application/ld+json
{% if seasonCategories.length %}
/season:season/*
  Link: <{{ siteUrl }}/season:season/:splatmetadata.json>; rel="describedby"; type="application/ld+json"; profile="https://schema.org/"
  Link: <{{ siteUrl }}/season:season/:splat>; rel="cite-as"
  Link: <https://schema.org/PodcastEpisode>; rel="type"
{% endif %}
{% for category in standaloneCategories %}
/{{ category }}/*
  Link: <{{ siteUrl }}/{{ category }}/:splatmetadata.json>; rel="describedby"; type="application/ld+json"; profile="https://schema.org/"
  Link: <{{ siteUrl }}/{{ category }}/:splat>; rel="cite-as"
  Link: <https://schema.org/PodcastEpisode>; rel="type"
{% endfor %}`;

const headers = await env.renderString(template, {
  siteUrl: SITE_URL,
  seasonCategories,
  standaloneCategories,
});

await fs.writeFile(output, `${headers.trim()}\n`);
console.log(`Generated _headers with ${standaloneCategories.length + (seasonCategories.length ? 1 : 0) + 2} wildcard rules for ${posts.length} posts`);
