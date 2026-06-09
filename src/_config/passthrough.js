export function registerPassthroughCopy(eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ public: "." });
  eleventyConfig.addPassthroughCopy({ LICENSE: "license/LICENSE" });
}
