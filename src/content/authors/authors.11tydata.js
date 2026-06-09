import { fileSlug } from "../../../scripts/site-data.mjs";

export default {
  layout: "author",
  eleventyComputed: {
    slug: (data) => fileSlug(data.page.inputPath),
    permalink: (data) => `/authors/${fileSlug(data.page.inputPath)}/`,
  },
};
