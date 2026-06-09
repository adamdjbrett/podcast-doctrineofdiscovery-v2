export default {
  pagination: {
    data: "site.posts",
    size: 6,
    alias: "paginator_posts",
  },
  permalink: (data) => {
    const page = data.pagination.pageNumber + 1;
    return page === 1 ? "/episodes/" : `/episodes/page${page}/`;
  },
  eleventyComputed: {
    paginator: (data) => {
      const page = data.pagination.pageNumber + 1;
      const totalPages = data.pagination.pages.length;
      return {
        posts: data.paginator_posts,
        page,
        total_pages: totalPages,
        previous_page: page > 1 ? page - 1 : null,
        previous_page_path: page === 2 ? "/episodes/" : `/episodes/page${page - 1}/`,
        next_page: page < totalPages ? page + 1 : null,
        next_page_path: page < totalPages ? `/episodes/page${page + 1}/` : null,
      };
    },
  },
};
