export function isTranscriptPdfUrl(value) {
  return /(^|\/)assets\/pdfs\/.*\.pdf$/i.test(String(value || ""));
}

function hasAttr(attrs, name) {
  return attrs.some(([key]) => key === name);
}

export function openTranscriptPdfLinksInNewWindow(md) {
  const defaultLinkOpen =
    md.renderer.rules.link_open ||
    ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const href = token.attrGet("href");

    if (isTranscriptPdfUrl(href)) {
      token.attrSet("target", "_blank");
      token.attrSet("rel", "noopener noreferrer");
      if (!hasAttr(token.attrs || [], "aria-label")) {
        token.attrSet("aria-label", "Open transcript PDF in a new window");
      }
    }

    return defaultLinkOpen(tokens, idx, options, env, self);
  };

  return md;
}
