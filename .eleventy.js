const MarkdownIt = require("markdown-it");
const { buildSiteData } = require("./scripts/site-data.cjs");
const packageJson = require("./package.json");

const md = new MarkdownIt({ html: true, linkify: false, typographer: false });
const siteData = buildSiteData();

function normalizeDate(value) {
  if (value instanceof Date) {
    return value;
  }
  return value ? new Date(value) : new Date();
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function stripHtml(value) {
  return String(value || "").replace(/<[^>]*>/g, "");
}

function xmlEscape(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function relativeUrl(value) {
  const baseurl = siteData.baseurl || "";
  const url = String(value || "");
  if (!url || /^([a-z]+:)?\/\//i.test(url) || url.startsWith("#")) {
    return url;
  }
  return `${baseurl}${url.startsWith("/") ? "" : "/"}${url}`;
}

function absoluteUrl(value) {
  const url = String(value || "");
  if (/^([a-z]+:)?\/\//i.test(url)) {
    return url;
  }
  return `${siteData.url}${relativeUrl(url)}`;
}

module.exports = function (eleventyConfig) {
  eleventyConfig.setLibrary("md", md);

  eleventyConfig.addPassthroughCopy({ public: "." });
  eleventyConfig.addPassthroughCopy("add-related-episodes.py");
  eleventyConfig.addPassthroughCopy("add-related-episodes.sh");
  eleventyConfig.addPassthroughCopy({ LICENSE: "license/LICENSE" });

  eleventyConfig.addGlobalData("site", () => siteData);
  eleventyConfig.addGlobalData("eleventyVersion", () => packageJson.devDependencies["@11ty/eleventy"].replace(/^[^\d]*/, ""));
  eleventyConfig.addGlobalData("eleventyComputed", {
    previous: (data) => {
      const postIndex = siteData.posts.findIndex((post) => post.url === data.page?.url);
      return postIndex >= 0 ? siteData.posts[postIndex + 1] || {} : {};
    },
    next: (data) => {
      const postIndex = siteData.posts.findIndex((post) => post.url === data.page?.url);
      return postIndex > 0 ? siteData.posts[postIndex - 1] || {} : {};
    },
    fileSlug: (data) => data.page?.fileSlug || data.slug,
  });

  eleventyConfig.addFilter("date_to_string", (value) => {
    const date = normalizeDate(value);
    return `${pad(date.getUTCDate())} ${date.toLocaleString("en", { month: "short", timeZone: "UTC" })} ${date.getUTCFullYear()}`;
  });
  eleventyConfig.addFilter("date_to_rfc822", (value) => normalizeDate(value).toUTCString());
  eleventyConfig.addFilter("date_to_xmlschema", (value) => normalizeDate(value).toISOString());
  eleventyConfig.addFilter("date", (value, format) => {
    const date = normalizeDate(value);
    if (format === "%Y/%m/%d") {
      return `${date.getUTCFullYear()}/${pad(date.getUTCMonth() + 1)}/${pad(date.getUTCDate())}`;
    }
    return date.toISOString();
  });
  eleventyConfig.addFilter("relative_url", relativeUrl);
  eleventyConfig.addFilter("absolute_url", absoluteUrl);
  eleventyConfig.addFilter("xml_escape", xmlEscape);
  eleventyConfig.addFilter("markdownify", (value) => md.render(String(value || "")));
  eleventyConfig.addFilter("strip_html", stripHtml);
  eleventyConfig.addFilter("strip_newlines", (value) => String(value || "").replace(/(\r\n|\n|\r)/gm, ""));
  eleventyConfig.addFilter("slugify", slugify);
  eleventyConfig.addFilter("where", (items, key, value) => (items || []).filter((item) => item && item[key] === value));
  eleventyConfig.addFilter("sort", (items, key) => {
    const list = Array.isArray(items) ? [...items] : Object.values(items || {});
    return list.sort((a, b) => {
      const left = key ? a?.[key] : a;
      const right = key ? b?.[key] : b;
      return String(left || "").localeCompare(String(right || ""));
    });
  });
  eleventyConfig.addFilter("first", (items) => (Array.isArray(items) ? items[0] : undefined));
  eleventyConfig.addFilter("jsonify", (value) => JSON.stringify(value));
  eleventyConfig.addFilter("escape", (value) => xmlEscape(value));
  eleventyConfig.addFilter("prepend", (value, prefix) => `${prefix || ""}${value || ""}`);

  eleventyConfig.addCollection("posts", () => siteData.posts);
  eleventyConfig.addCollection("authors", () => siteData.authors);

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
    },
    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "liquid",
    templateFormats: ["md", "html", "liquid", "xml", "txt", "json"],
  };
};
