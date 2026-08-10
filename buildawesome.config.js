import fs from "node:fs";
import { loadSiteData } from "./scripts/site-data-cache.mjs";
import { registerCollections } from "./src/_config/collections.js";
import { registerFilters } from "./src/_config/filters.js";
import { registerGlobalData } from "./src/_config/global-data.js";
import md from "./src/_config/markdown.js";
import { registerPassthroughCopy } from "./src/_config/passthrough.js";

const rootUrl = new URL("./", import.meta.url);
const packageJson = JSON.parse(fs.readFileSync(new URL("package.json", rootUrl), "utf8"));

// Stable object identity: filters, collections and computed data all close over
// `siteData`, so watch-mode refreshes mutate it in place rather than replacing it.
const siteData = loadSiteData();
let lastLoaded = siteData;

function refreshSiteData() {
  const fresh = loadSiteData();
  if (fresh === lastLoaded) {
    return;
  }
  lastLoaded = fresh;
  for (const key of Object.keys(siteData)) {
    delete siteData[key];
  }
  Object.assign(siteData, fresh);
}

export default function (eleventyConfig) {
  eleventyConfig.setLibrary("md", md);

  eleventyConfig.setServerOptions({ port: 8080 });

  // Keep `--serve` honest: episode edits change tag/category/author rollups too.
  eleventyConfig.on("eleventy.before", refreshSiteData);

  registerPassthroughCopy(eleventyConfig);
  registerGlobalData(eleventyConfig, { packageJson, rootUrl, siteData });
  registerFilters(eleventyConfig, { md, siteData });
  registerCollections(eleventyConfig, siteData);

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
}
