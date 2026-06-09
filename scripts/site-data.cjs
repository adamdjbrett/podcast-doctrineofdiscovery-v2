const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const MarkdownIt = require("markdown-it");

const md = new MarkdownIt({ html: true, linkify: false, typographer: false });

const ROOT = path.resolve(__dirname, "..");
const SITE_URL = "https://podcast.doctrineofdiscovery.org";

const legacyRedirects = {
  "/episodes/episode-0/": `${SITE_URL}/season1/episode-0/`,
  "/episodes/category/season-1": `${SITE_URL}/season1/episode-0/`,
  "/0/": `${SITE_URL}/season1/episode-0/`,
  "/episodes/episode-01/": `${SITE_URL}/season1/episode-01/`,
  "/pdfs/Episode-01-The-Legal-Framework-of-the-Doctrine-of-Christian-Discovery-in-Practice.pdf": `${SITE_URL}/season1/episode-01/`,
  "/episodes/episode-02/": `${SITE_URL}/season1/episode-02/`,
  "/episodes/episode-02.html": `${SITE_URL}/season1/episode-02/`,
  "/episodes/episode-03/": `${SITE_URL}/season1/episode-03/`,
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
  "/adam/": `${SITE_URL}/authors/adamdjbrett/`,
  "/Search/": `${SITE_URL}/search/`,
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

function parseFrontMatter(filePath) {
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

function fileSlug(filePath) {
  return path.basename(filePath, path.extname(filePath)).replace(/^\d{4}-\d{2}-\d{2}-/, "");
}

function postUrl(post) {
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

function readPosts() {
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
    return {
      ...data,
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
  return `${clean}.html`;
}

function redirectListFrom(redirects) {
  return Object.entries(redirects)
    .map(([from, to]) => ({
      from,
      to,
      output: redirectOutputPath(from),
    }))
    .filter((redirect) => redirect.from !== "/Search/");
}

function buildSiteData() {
  const config = readYamlFile(path.join(ROOT, "src", "_data", "site.yml"));
  const posts = readPosts();
  const authors = readAuthors();
  const pages = readPages();

  const redirects = redirectsFor([...posts, ...authors, ...pages]);

  return {
    ...config,
    url: (config.url || SITE_URL).replace(/\/$/, ""),
    baseurl: config.baseurl || "",
    time: new Date(),
    posts,
    authors,
    pages,
    categories: groupByList(posts, "categories"),
    tags: groupByList(posts, "tags"),
    data: readDataDir(),
    locale: config.locale || "en",
    redirects,
    redirectList: redirectListFrom(redirects),
  };
}

module.exports = {
  ROOT,
  SITE_URL,
  buildSiteData,
  fileSlug,
  parseFrontMatter,
  postUrl,
  readPosts,
};
