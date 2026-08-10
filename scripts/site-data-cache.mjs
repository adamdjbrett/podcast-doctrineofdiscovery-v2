// JSON cache in front of buildSiteData().
//
// buildSiteData() walks every episode/author/page markdown file, parses front
// matter and renders markdown. That work is repeated by the config file and by
// each postbuild/check script that runs in its own Node process. Caching the
// result as JSON turns those repeats into a stat-walk plus a JSON.parse.
//
// The cache is keyed on a fingerprint of every source file the builder reads,
// so an edit anywhere under src/ (or to the builder itself) invalidates it.

import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { ROOT, buildSiteData } from "./site-data.mjs";

const CACHE_VERSION = 1;
const CACHE_DIR = path.join(ROOT, ".cache");
const CACHE_FILE = path.join(CACHE_DIR, "site-data.json");

// Everything buildSiteData() reads. src/ is walked wholesale: _includes and
// _layouts do not feed site data, but including them only costs an occasional
// extra rebuild and keeps the fingerprint honest if that ever changes.
const SOURCE_DIRS = [path.join(ROOT, "src")];
const SOURCE_FILES = [
  path.join(ROOT, "scripts", "site-data.mjs"),
  path.join(ROOT, "scripts", "podcasting-data.mjs"),
  path.join(ROOT, "scripts", "markdown-transcript-links.mjs"),
  // Cached post bodies are markdown-it output, so a dependency change can alter
  // them without any source file moving. The lockfile stands in for that.
  path.join(ROOT, "package-lock.json"),
];

let memo = null;

function fingerprintEntries(dir, hash) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      fingerprintEntries(fullPath, hash);
    } else if (entry.isFile()) {
      hashFile(fullPath, hash);
    }
  }
}

function hashFile(filePath, hash) {
  try {
    const stat = fs.statSync(filePath);
    hash.update(`${path.relative(ROOT, filePath)}:${stat.size}:${stat.mtimeMs}\n`);
  } catch {
    hash.update(`${path.relative(ROOT, filePath)}:missing\n`);
  }
}

export function sourceFingerprint() {
  const hash = createHash("sha1").update(`v${CACHE_VERSION}\n`);
  for (const dir of SOURCE_DIRS) {
    fingerprintEntries(dir, hash);
  }
  for (const file of SOURCE_FILES) {
    hashFile(file, hash);
  }
  return hash.digest("hex");
}

// Dates survive the round trip as tagged objects; a plain ISO string would be
// indistinguishable from front matter that legitimately holds one.
function dateReplacer(key, value) {
  const raw = this[key];
  return raw instanceof Date ? { __date: raw.toISOString() } : value;
}

function dateReviver(key, value) {
  if (value && typeof value === "object" && typeof value.__date === "string" && Object.keys(value).length === 1) {
    return new Date(value.__date);
  }
  return value;
}

// Posts are shared by reference across posts/categories/tags/*List. Storing the
// groups as indexes into `posts` keeps the file ~1MB instead of ~12MB.
function encode(site) {
  const indexOf = new Map(site.posts.map((post, index) => [post, index]));
  const encodeGroups = (groups) =>
    Object.fromEntries(Object.entries(groups).map(([name, posts]) => [name, posts.map((post) => indexOf.get(post))]));
  const encodeList = (list) => list.map((item) => ({ ...item, posts: item.posts.map((post) => indexOf.get(post)) }));

  return {
    version: CACHE_VERSION,
    site: {
      ...site,
      time: undefined,
      categories: encodeGroups(site.categories),
      tags: encodeGroups(site.tags),
      categoryList: encodeList(site.categoryList),
      tagList: encodeList(site.tagList),
    },
  };
}

function decode(payload) {
  const site = payload.site;
  const posts = site.posts;
  const decodeGroups = (groups) =>
    Object.fromEntries(Object.entries(groups).map(([name, indexes]) => [name, indexes.map((index) => posts[index])]));
  const decodeList = (list) => list.map((item) => ({ ...item, posts: item.posts.map((index) => posts[index]) }));

  return {
    ...site,
    time: new Date(),
    categories: decodeGroups(site.categories),
    tags: decodeGroups(site.tags),
    categoryList: decodeList(site.categoryList),
    tagList: decodeList(site.tagList),
  };
}

function readCache(fingerprint) {
  try {
    const raw = fs.readFileSync(CACHE_FILE, "utf8");
    const payload = JSON.parse(raw, dateReviver);
    if (payload?.version !== CACHE_VERSION || payload.fingerprint !== fingerprint) {
      return null;
    }
    return decode(payload);
  } catch {
    return null;
  }
}

function writeCache(fingerprint, site) {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify({ fingerprint, ...encode(site) }, dateReplacer));
  } catch {
    // A read-only or racing filesystem just means the next run rebuilds.
  }
}

/**
 * Site data for the current source tree. Returns the identical object across
 * calls while the sources are unchanged, so callers may hold onto the
 * reference and re-call to pick up edits (the dev server does exactly this).
 */
export function loadSiteData() {
  const fingerprint = sourceFingerprint();
  if (memo?.fingerprint === fingerprint) {
    return memo.site;
  }

  const cached = readCache(fingerprint);
  if (cached) {
    memo = { fingerprint, site: cached };
    return cached;
  }

  const site = buildSiteData();
  writeCache(fingerprint, site);
  memo = { fingerprint, site };
  return site;
}

/** Episodes only — the shape most postbuild/check scripts want. */
export function loadPosts() {
  return loadSiteData().posts;
}
