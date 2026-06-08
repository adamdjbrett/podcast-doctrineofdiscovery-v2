const { fileSlug } = require("../../../scripts/site-data.cjs");

module.exports = {
  layout: "author",
  eleventyComputed: {
    slug: (data) => fileSlug(data.page.inputPath),
    permalink: (data) => `/authors/${fileSlug(data.page.inputPath)}/`,
  },
};
