import { buildJsonLd } from "../../scripts/schema-data.mjs";

export function registerGlobalData(eleventyConfig, { packageJson, siteData }) {
  eleventyConfig.addGlobalData("site", () => siteData);
  eleventyConfig.addGlobalData("eleventyVersion", () => packageJson.dependencies["@awesome.me/buildawesome"].replace(/^[^\d]*/, ""));
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
