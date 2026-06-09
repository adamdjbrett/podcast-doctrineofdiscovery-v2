const MarkdownIt = require("markdown-it");

module.exports = new MarkdownIt({ html: true, linkify: false, typographer: false });
