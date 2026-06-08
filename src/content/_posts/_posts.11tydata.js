const { fileSlug } = require("../../../scripts/site-data.cjs");

module.exports = {
  layout: "post",
  eleventyComputed: {
    slug: (data) => fileSlug(data.page.inputPath),
    permalink: (data) => {
      const categories = Array.isArray(data.categories) ? data.categories : [data.categories].filter(Boolean);
      return `/${categories[0]}/${fileSlug(data.page.inputPath)}/`;
    },
  },
};
