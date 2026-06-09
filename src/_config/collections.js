function registerCollections(eleventyConfig, siteData) {
  eleventyConfig.addCollection("posts", () => siteData.posts);
  eleventyConfig.addCollection("authors", () => siteData.authors);
}

module.exports = {
  registerCollections,
};
