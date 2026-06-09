import fs from "node:fs";
import { buildSiteData } from "./scripts/site-data.mjs";
import { registerCollections } from "./src/_config/collections.js";
import { registerFilters } from "./src/_config/filters.js";
import { registerGlobalData } from "./src/_config/global-data.js";
import md from "./src/_config/markdown.js";
import { registerPassthroughCopy } from "./src/_config/passthrough.js";

const packageJson = JSON.parse(fs.readFileSync(new URL("./package.json", import.meta.url), "utf8"));
const siteData = buildSiteData();

export default function (eleventyConfig) {
  eleventyConfig.setLibrary("md", md);

  registerPassthroughCopy(eleventyConfig);
  registerGlobalData(eleventyConfig, { packageJson, siteData });
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
