function relativeUrl(siteData, value) {
  const baseurl = siteData.baseurl || "";
  const url = String(value || "");
  if (!url || /^([a-z]+:)?\/\//i.test(url) || url.startsWith("#")) {
    return url;
  }
  return `${baseurl}${url.startsWith("/") ? "" : "/"}${url}`;
}

function absoluteUrl(siteData, value) {
  const url = String(value || "");
  if (/^([a-z]+:)?\/\//i.test(url)) {
    return url;
  }
  return `${siteData.url}${relativeUrl(siteData, url)}`;
}

module.exports = {
  absoluteUrl,
  relativeUrl,
};
