import MarkdownIt from "markdown-it";
import { openTranscriptPdfLinksInNewWindow } from "../../scripts/markdown-transcript-links.mjs";

export default openTranscriptPdfLinksInNewWindow(new MarkdownIt({ html: true, linkify: false, typographer: false }));
