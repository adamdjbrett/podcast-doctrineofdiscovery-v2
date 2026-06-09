export function registerCollections(eleventyConfig, siteData) {
  eleventyConfig.addCollection("posts", () => siteData.posts);
  eleventyConfig.addCollection("authors", () => siteData.authors);
  eleventyConfig.addCollection("tagList", () => siteData.tagList);
}
