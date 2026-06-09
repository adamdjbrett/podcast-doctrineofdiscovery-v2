import { fileSlug } from "../../../scripts/site-data.mjs";

function categoriesFor(data) {
  return Array.isArray(data.categories) ? data.categories : [data.categories].filter(Boolean);
}

function pageUrl(data) {
  const [category] = categoriesFor(data);
  return `/${category}/${fileSlug(data.page.inputPath)}/`;
}

function findPost(data) {
  const url = pageUrl(data);
  return data.site?.posts?.find((post) => post.url === url) || {};
}

export default {
  layout: "post",
  eleventyComputed: {
    slug: (data) => fileSlug(data.page.inputPath),
    permalink: (data) => pageUrl(data),
    creators: (data) => findPost(data).creators || data.site.people.creators,
    hosts: (data) => findPost(data).hosts || data.site.people.hosts,
    producers: (data) => findPost(data).producers || data.site.people.producers,
    contributors: (data) => findPost(data).contributors || data.site.people.hosts,
    publisher: (data) => findPost(data).publisher || data.site.people.publisher,
    rights: (data) => findPost(data).rights || data.site.rights,
    language: (data) => findPost(data).language || "en",
    type: (data) => findPost(data).type || "Sound",
    format: (data) => findPost(data).format || "audio/mpeg",
    identifier: (data) => findPost(data).identifier || `${data.site.url}${pageUrl(data)}`,
    source: (data) => findPost(data).source || data.site.title,
    relations: (data) => findPost(data).relations || [`${data.site.url}${pageUrl(data)}`],
    coverage: (data) => findPost(data).coverage || categoriesFor(data),
    transcript_pdf: (data) => findPost(data).transcript_pdf || data.transcript_pdf || "",
  },
};
