import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import MarkdownIt from "markdown-it";
import { openTranscriptPdfLinksInNewWindow } from "./markdown-transcript-links.mjs";
import { PODCASTING_2_0 } from "./podcasting-data.mjs";

const md = openTranscriptPdfLinksInNewWindow(new MarkdownIt({ html: true, linkify: false, typographer: false }));

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const SITE_URL = "https://podcast.doctrineofdiscovery.org";
export const RIGHTS = {
  label: "Creative Commons Attribution 4.0 International",
  url: "https://creativecommons.org/licenses/by/4.0/",
  text: "This work is licensed under a Creative Commons Attribution 4.0 International License.",
};

export const PODCAST_PEOPLE = {
  creators: [
    { name: "Philip P. Arnold", url: "https://artsandsciences.syracuse.edu/people/faculty/arnold-philip-p/" },
    { name: "Sandra Bigtree", url: "https://indigenousvalues.org/about/our-team/" },
    { name: "Adam DJ Brett", url: "https://adamdjbrett.com/" },
    { name: "Jordan Brady Loewen-Colón", url: "https://www.jordanbradyloewen.com/" },
  ],
  hosts: [
    { name: "Philip P. Arnold", url: "https://artsandsciences.syracuse.edu/people/faculty/arnold-philip-p/" },
    { name: "Sandra Bigtree", url: "https://indigenousvalues.org/about/our-team/" },
  ],
  producers: [
    { name: "Adam DJ Brett", url: "https://adamdjbrett.com/" },
    { name: "Jordan Brady Loewen-Colón", url: "https://www.jordanbradyloewen.com/" },
  ],
  publisher: { name: "Indigenous Values Initiative", url: "https://indigenousvalues.org/" },
};

const legacyRedirects = {
  "/episodes/episode-0/": `${SITE_URL}/season1/episode-0/`,
  "/episodes/category/season-1": `${SITE_URL}/season1/episode-0/`,
  "/0/": `${SITE_URL}/season1/episode-0/`,
  "/episodes/episode-01/": `${SITE_URL}/season1/episode-01/`,
  "/pdfs/Episode-01-The-Legal-Framework-of-the-Doctrine-of-Christian-Discovery-in-Practice.pdf": `${SITE_URL}/season1/episode-01/`,
  "/episodes/episode-02/": `${SITE_URL}/season1/episode-02/`,
  "/episodes/episode-02.html": `${SITE_URL}/season1/episode-02/`,
  "/episodes/episode-03/": `${SITE_URL}/season1/episode-03/`,
  "/episodes/episode-03": `${SITE_URL}/season1/episode-03/`,
  "/season1/episode-03.html": `${SITE_URL}/season1/episode-03/`,
  "/episodes/episode-04/": `${SITE_URL}/season1/episode-04/`,
  "/pdfs/Episode-04-The-Haudenosaunee-influence-womens-movement.pdf": `${SITE_URL}/season1/episode-04/`,
  "/episodes/episode-05/": `${SITE_URL}/season1/episode-05/`,
  "/episodes/category/season-2/": `${SITE_URL}/season2/episode-01/`,
  "/episodes/category/season-2/episode-01/": `${SITE_URL}/season2/episode-01/`,
  "/season2/episode-": `${SITE_URL}/season2/episode-01/`,
  "/special/episode-01/": `${SITE_URL}/special/s01/`,
  "/special/episode-02/": `${SITE_URL}/special/s02/`,
  "/special/episode-03/": `${SITE_URL}/special/s03/`,
  "/special/episode-04/": `${SITE_URL}/special/s04/`,
  "/special/episode-05/": `${SITE_URL}/special/s05/`,
  "/special/episode-06/": `${SITE_URL}/special/s06/`,
  "/special/episode-07/": `${SITE_URL}/special/s07/`,
  "/special/episode-08/": `${SITE_URL}/special/s08/`,
  "/assets/pdfs/S02E01-Hidden-Roots-White-Supremacy-Robert-P-Jones-PRRI-TRANSCRIPT.pdf": `${SITE_URL}/season3/episode-01/`,
  "/assets/pdfs/S2E01–The-Backstory-of-Johnson-v-MIntosh-Lindsay-Robertson-TRANSCRIPT.pdf": `${SITE_URL}/assets/pdfs/S2E01-The-Backstory-of-Johnson-v-MIntosh-Lindsay-Robertson-TRANSCRIPT.pdf`,
  "/assets/pdfs/S02E02-The-International-Dimensions-of-Johnson-v-M’Intosh-Robert-J-Miller-TRANSCRIPT.pdf": `${SITE_URL}/assets/pdfs/S02E02-The-International-Dimensions-of-Johnson-v-MIntosh-Robert-J-Miller-TRANSCRIPT.pdf`,
  "/assets/pdfs/NICWA_ICWA-Decision-Day-Statement-FINAL.PDF": `${SITE_URL}/assets/pdfs/NICWA_ICWA-Decision-Day-Statement-FINAL.pdf`,
  "/adam/": `${SITE_URL}/authors/adamdjbrett/`,
  "/Search/": `${SITE_URL}/search/`,
  "/pages/thank-you": `${SITE_URL}/thank-you/`,
  "/tag": `${SITE_URL}/tags/`,
  "/tag/": `${SITE_URL}/tags/`,
  "/tag.html": `${SITE_URL}/tags/`,
  "/categories.html": `${SITE_URL}/categories/`,
};

function readYamlFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  return yaml.load(fs.readFileSync(filePath, "utf8"), { json: true }) || {};
}

function walk(dir, predicate = () => true) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return walk(fullPath, predicate);
    }
    return predicate(fullPath) ? [fullPath] : [];
  });
}

export function parseFrontMatter(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  if (!raw.startsWith("---")) {
    return { data: {}, content: raw };
  }
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return { data: {}, content: raw };
  }
  return {
    data: yaml.load(match[1], { json: true }) || {},
    content: raw.slice(match[0].length),
  };
}

function normalizeArray(value) {
  if (value === undefined || value === null || value === "") {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function normalizePeople(value) {
  return normalizeArray(value)
    .map((person) => (typeof person === "string" ? { name: person } : person))
    .filter((person) => person?.name);
}

export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanText(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstLocalPdfLink(content) {
  const match = String(content || "").match(/\]\((\/assets\/pdfs\/[^)]*?\.pdf)\)/i);
  return match ? match[1] : "";
}

function linksFromMarkdown(content) {
  return [...String(content || "").matchAll(/\[[^\]]+\]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/g)]
    .map((match) => match[1])
    .filter((url) => !url.startsWith("/assets/citations/"));
}

function episodeMetadata(data, rawContent, url) {
  const guests = normalizePeople(data.guests);
  const contributors = [...PODCAST_PEOPLE.hosts, ...guests, ...normalizePeople(data.contributors)];
  const description = cleanText(data.description || data.excerpt);
  const relations = normalizeArray(data.relations).length ? normalizeArray(data.relations) : linksFromMarkdown(rawContent).slice(0, 12);
  const coverage = normalizeArray(data.coverage).length ? normalizeArray(data.coverage) : normalizeArray(data.categories);

  return {
    creators: normalizePeople(data.creators).length ? normalizePeople(data.creators) : PODCAST_PEOPLE.creators,
    contributors,
    hosts: normalizePeople(data.hosts).length ? normalizePeople(data.hosts) : PODCAST_PEOPLE.hosts,
    producers: normalizePeople(data.producers).length ? normalizePeople(data.producers) : PODCAST_PEOPLE.producers,
    publisher: data.publisher || PODCAST_PEOPLE.publisher,
    rights: data.rights || RIGHTS,
    language: data.language || "en",
    type: data.type || "Sound",
    format: data.format || (data.duration ? `audio/mpeg; duration=${data.duration}` : "audio/mpeg"),
    identifier: `${SITE_URL}${url}`,
    source: data.source || "Mapping the Doctrine of Discovery Podcast",
    coverage,
    relations,
    transcript_pdf: data.transcript_pdf || firstLocalPdfLink(rawContent),
    description,
  };
}

export function fileSlug(filePath) {
  return path.basename(filePath, path.extname(filePath)).replace(/^\d{4}-\d{2}-\d{2}-/, "");
}

export function postUrl(post) {
  const category = normalizeArray(post.categories)[0] || "";
  return `/${category}/${post.slug}/`.replace(/\/+/g, "/");
}

function authorUrl(author) {
  return `/authors/${author.slug}/`;
}

function expandKnownIncludes(content, slug) {
  return String(content || "").replace(
    /\{%\s*include\s+["']citation-links\.html["']\s*%\}/g,
    [
      "**Download citation formats:**",
      `- [Download RIS citation](/assets/citations/${slug}.ris)`,
      `- [Download CSL-JSON citation](/assets/citations/${slug}.csl.json)`,
    ].join("\n")
  );
}

function stripLiquid(content) {
  return String(content || "")
    .replace(/\{%-?[\s\S]*?-?%\}/g, "")
    .replace(/\{\{[\s\S]*?\}\}/g, "");
}

function renderMarkdown(content, slug = "") {
  return md.render(stripLiquid(expandKnownIncludes(content, slug)));
}

function cleanExcerpt(value) {
  if (!value) {
    return "";
  }
  return String(value);
}

export function readPosts() {
  const postsDir = path.join(ROOT, "src", "content", "episodes");
  const posts = walk(postsDir, (file) => /\.md$/.test(file)).map((inputPath) => {
    const parsed = parseFrontMatter(inputPath);
    const slug = fileSlug(inputPath);
    const data = {
      ...parsed.data,
      categories: normalizeArray(parsed.data.categories),
      tags: normalizeArray(parsed.data.tags),
      date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
      slug,
    };
    const url = postUrl(data);
    const metadata = episodeMetadata(data, parsed.content, url);
    return {
      ...data,
      ...metadata,
      id: url,
      inputPath,
      path: inputPath,
      url,
      content: renderMarkdown(parsed.content, slug),
      rawContent: parsed.content,
      excerpt: cleanExcerpt(parsed.data.excerpt),
    };
  });

  return posts.sort((a, b) => {
    const diff = b.date.getTime() - a.date.getTime();
    if (diff !== 0) {
      return diff;
    }
    return b.inputPath.localeCompare(a.inputPath);
  });
}

function readAuthors() {
  const authorsDir = path.join(ROOT, "src", "content", "authors");
  return walk(authorsDir, (file) => /\.md$/.test(file)).map((inputPath) => {
    const parsed = parseFrontMatter(inputPath);
    const slug = fileSlug(inputPath);
    const data = { ...parsed.data, slug };
    const url = authorUrl(data);
    return {
      ...data,
      inputPath,
      path: inputPath,
      url,
      content: renderMarkdown(parsed.content),
      rawContent: parsed.content,
    };
  });
}

function readPages() {
  const srcDir = path.join(ROOT, "src");
  const ignored = new Set(["_data", "_includes", "_layouts", "content"]);
  return walk(srcDir, (file) => {
    const rel = path.relative(srcDir, file);
    const top = rel.split(path.sep)[0];
    if (ignored.has(top)) {
      return false;
    }
    return /\.(md|html)$/.test(file);
  }).map((inputPath) => {
    const parsed = parseFrontMatter(inputPath);
    const rel = path.relative(srcDir, inputPath);
    const ext = path.extname(inputPath);
    const slug = fileSlug(inputPath);
    let url = parsed.data.permalink;
    if (!url) {
      if (rel === "index.md" || rel === "index.html") {
        url = "/";
      } else if (ext === ".html" && !rel.includes(path.sep)) {
        url = `/${path.basename(rel, ext)}.html`;
      } else {
        url = `/${rel.slice(0, -ext.length)}/`;
      }
    }
    return {
      ...parsed.data,
      inputPath,
      path: inputPath,
      url,
      slug,
      content: renderMarkdown(parsed.content),
      rawContent: parsed.content,
    };
  });
}

function groupByList(posts, key) {
  return posts.reduce((groups, post) => {
    normalizeArray(post[key]).forEach((item) => {
      if (!groups[item]) {
        groups[item] = [];
      }
      groups[item].push(post);
    });
    return groups;
  }, {});
}

function tagListFromGroups(tags) {
  return Object.entries(tags)
    .map(([name, posts]) => ({
      name,
      slug: slugify(name),
      url: `/tags/${slugify(name)}/`,
      count: posts.length,
      posts,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function readDataDir() {
  const dataDir = path.join(ROOT, "src", "_data");
  const data = {};
  if (!fs.existsSync(dataDir)) {
    return data;
  }
  for (const file of fs.readdirSync(dataDir)) {
    const fullPath = path.join(dataDir, file);
    if (!fs.statSync(fullPath).isFile()) {
      continue;
    }
    const ext = path.extname(file);
    const name = path.basename(file, ext);
    if (ext === ".yml" || ext === ".yaml") {
      data[name] = readYamlFile(fullPath);
    } else if (ext === ".json") {
      data[name] = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    }
  }
  data.text = data.text || { en: {} };
  return data;
}

function redirectsFor(items) {
  const redirects = { ...legacyRedirects };
  for (const item of items) {
    for (const from of normalizeArray(item.redirect_from)) {
      redirects[from] = `${SITE_URL}${item.url}`;
    }
  }
  return redirects;
}

function redirectOutputPath(from) {
  const clean = String(from || "").replace(/^\//, "");
  if (clean.endsWith("/")) {
    return `${clean}index.html`;
  }
  if (path.extname(clean)) {
    return clean;
  }
  return `${clean}/index.html`;
}

function redirectListFrom(redirects) {
  const seenOutputs = new Set();
  return Object.entries(redirects)
    .map(([from, to]) => ({
      from,
      to,
      output: redirectOutputPath(from),
    }))
    .filter((redirect) => {
      if (redirect.from === "/Search/" || seenOutputs.has(redirect.output)) {
        return false;
      }
      seenOutputs.add(redirect.output);
      return true;
    });
}

export function buildSiteData() {
  const config = readYamlFile(path.join(ROOT, "src", "_data", "site.yml"));
  const posts = readPosts();
  const authors = readAuthors();
  const pages = readPages();
  const tags = groupByList(posts, "tags");

  const redirects = redirectsFor([...posts, ...authors, ...pages]);

  return {
    ...config,
    people: PODCAST_PEOPLE,
    podcasting: PODCASTING_2_0,
    rights: RIGHTS,
    url: (config.url || SITE_URL).replace(/\/$/, ""),
    baseurl: config.baseurl || "",
    time: new Date(),
    posts,
    authors,
    pages,
    categories: groupByList(posts, "categories"),
    tags,
    tagList: tagListFromGroups(tags),
    data: readDataDir(),
    locale: config.locale || "en",
    redirects,
    redirectList: redirectListFrom(redirects),
  };
}
