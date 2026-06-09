export default {
  eleventyComputed: {
    permalink: (data) => {
      if (data.permalink) {
        return data.permalink;
      }
      return `/pages/${data.page.fileSlug}.html`;
    },
  },
};
