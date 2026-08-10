import { buildJsonLd } from "../../scripts/schema-data.mjs";
import { resolveGenerator } from "./generator.js";

export function registerGlobalData(eleventyConfig, { packageJson, rootUrl, siteData }) {
  const generator = resolveGenerator(rootUrl, packageJson);

  eleventyConfig.addGlobalData("site", () => siteData);
  eleventyConfig.addGlobalData("generator", () => generator);
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
    jsonLd: (data) => buildJsonLd(data),
  });
}
