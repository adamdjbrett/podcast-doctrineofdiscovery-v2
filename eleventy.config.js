const { buildSiteData } = require("./scripts/site-data.cjs");
const packageJson = require("./package.json");
const { registerCollections } = require("./src/_config/collections.js");
const { registerFilters } = require("./src/_config/filters.js");
const { registerGlobalData } = require("./src/_config/global-data.js");
const md = require("./src/_config/markdown.js");
const { registerPassthroughCopy } = require("./src/_config/passthrough.js");

const siteData = buildSiteData();

module.exports = function (eleventyConfig) {
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
};
