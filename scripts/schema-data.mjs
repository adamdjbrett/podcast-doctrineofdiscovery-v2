import { SITE_URL, slugify } from "./site-data.mjs";

const SAME_AS = [
  "https://castbox.fm/channel/id4792172",
  "https://castro.fm/share/podcast/36e330ca-d4ce-4f7a-8b81-310c658ae618",
  "https://facebook.com/indigenousvalues",
  "https://goodpods.com/podcasts/mapping-the-doctrine-of-discovery-198087",
  "https://open.spotify.com/show/5VoYjujmNFCYS89vSsgl1c",
  "https://pca.st/ah3neigt",
  "https://player.fm/series/mapping-the-doctrine-of-discovery",
  "https://podbay.fm/p/mapping-the-doctrine-of-discovery",
  "https://podcastaddict.com/podcast/mapping-the-doctrine-of-discovery/6231358",
  "https://podcastindex.org/podcast/4947967",
  "https://podcasts.apple.com/us/podcast/mapping-the-doctrine-of-discovery/id1609802758",
  "https://podtail.com/en/podcast/mapping-the-doctrine-of-discovery/",
  "https://rss.buzzsprout.com/1926214.rss",
  "https://twitter.com/ailanyc",
  "https://twitter.com/indigenousVI",
  "https://www.amazon.com/Mapping-the-Doctrine-of-Discovery/dp/B08K587WP7/",
  "https://www.audible.com/podcast/Mapping-the-Doctrine-of-Discovery/episodes/B08K573YQP",
  "https://www.deezer.com/us/show/3406542",
  "https://www.facebook.com/americanindianlawalliance",
  "https://www.facebook.com/doctrineofdiscovery",
  "https://www.facebook.com/indigenousvalues",
  "https://www.iheart.com/podcast/269-mapping-the-doctrine-of-di-92831293/",
  "https://www.instagram.com/americanindianlawalliance/",
  "https://www.instagram.com/indigenousvalues/",
  "https://www.podchaser.com/podcasts/mapping-the-doctrine-of-discov-4249128",
  "https://www.radio.net/podcast/mapping-the-doctrine-of-discovery",
  "https://tunein.com/podcasts/Mapping-the-Doctrine-of-Discovery-p1625376/",
  "https://pod.link/1609802758",
  "https://youtube.com/c/IndigenousValuesInitiative",
];

function compact(value) {
  if (Array.isArray(value)) {
    return value.map(compact).filter((item) => item !== undefined && item !== null && item !== "");
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .map(([key, item]) => [key, compact(item)])
        .filter(([, item]) => {
          if (item === undefined || item === null || item === "") {
            return false;
          }
          return !(Array.isArray(item) && item.length === 0);
        })
    );
  }
  return value;
}

function absolute(site, value = "/") {
  if (/^https?:\/\//.test(String(value))) {
    return value;
  }
  const base = (site?.url || SITE_URL).replace(/\/$/, "");
  const path = String(value || "/");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function person(person) {
  return compact({
    "@type": "Person",
    name: person?.name || person,
    url: person?.url,
  });
}

function organization(site) {
  return compact({
    "@type": "Organization",
    "@id": `${absolute(site, "/")}#organization`,
    name: site.people.publisher.name,
    url: site.people.publisher.url || absolute(site, "/"),
    logo: {
      "@type": "ImageObject",
      url: absolute(site, site.logo || site.cover),
    },
    sameAs: [site.social?.facebook, site.social?.instagram, site.social?.youtube].filter(Boolean),
  });
}

function podcastSeries(site) {
  return compact({
    "@type": "PodcastSeries",
    "@id": `${absolute(site, "/")}#podcast`,
    name: site.title,
    description: site.description,
    url: absolute(site, "/"),
    image: absolute(site, site.cover),
    inLanguage: site.locale || "en",
    creator: site.people.creators.map(person),
    author: site.people.hosts.map(person),
    producer: site.people.producers.map(person),
    publisher: { "@id": `${absolute(site, "/")}#organization` },
    productionCompany: { "@id": `${absolute(site, "/")}#organization` },
    license: site.rights.url,
    copyrightHolder: { "@id": `${absolute(site, "/")}#organization` },
    copyrightNotice: site.rights.text,
    publicationFrequency: "Quarterly",
    sameAs: SAME_AS,
  });
}

function webSite(site) {
  return compact({
    "@type": "WebSite",
    "@id": `${absolute(site, "/")}#website`,
    name: site.title,
    url: absolute(site, "/"),
    publisher: { "@id": `${absolute(site, "/")}#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: `${absolute(site, "/search/")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  });
}

function labelForSegment(segment) {
  if (/^season\d+$/.test(segment)) {
    return `Season ${segment.replace("season", "")}`;
  }
  if (/^s\d+$/.test(segment)) {
    return `Special ${segment.replace("s", "")}`;
  }
  return segment
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function breadcrumbItems(site, data, pageUrl) {
  const items = [{ name: "Home", item: absolute(site, "/") }];
  const segments = String(pageUrl || "/").split("/").filter(Boolean);
  let current = "";

  segments.forEach((segment, index) => {
    current += `/${segment}`;
    const isLast = index === segments.length - 1;
    items.push({
      name: isLast ? data.title || labelForSegment(segment) : labelForSegment(segment),
      item: absolute(site, `${current}/`),
    });
  });

  return items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.item,
  }));
}

function breadcrumbList(site, data, pageUrl) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${absolute(site, pageUrl)}#breadcrumb`,
    itemListElement: breadcrumbItems(site, data, pageUrl),
  };
}

function episodeNumber(slug = "") {
  const match = String(slug).match(/(?:episode-|^s)(\d+)$/);
  return match ? match[1].replace(/^0+/, "") || "0" : undefined;
}

function seasonNumber(categories = []) {
  const season = categories.find((category) => /^season\d+$/.test(category));
  return season ? season.replace("season", "") : undefined;
}

function buzzsproutEmbedUrl(rawContent = "") {
  const match = rawContent.match(/https:\/\/www\.buzzsprout\.com\/[^"'\s<>]+\.js[^"'\s<>]*/);
  return match ? match[0].replace(/&amp;/g, "&") : "";
}

function podcastEpisode(site, data, pageUrl) {
  const pageId = `${absolute(site, pageUrl)}#webpage`;
  const episodeId = `${absolute(site, pageUrl)}#podcast-episode`;
  const categories = Array.isArray(data.categories) ? data.categories : [data.categories].filter(Boolean);
  const season = seasonNumber(categories);
  const embedUrl = buzzsproutEmbedUrl(data.rawContent);

  return compact({
    "@type": "PodcastEpisode",
    "@id": episodeId,
    name: data.title,
    headline: data.title,
    alternativeHeadline: data.subtitle,
    description: data.description || data.excerpt || site.description,
    abstract: data.excerpt || data.description,
    url: absolute(site, pageUrl),
    mainEntityOfPage: { "@id": pageId },
    isPartOf: { "@id": `${absolute(site, "/")}#podcast` },
    partOfSeries: { "@id": `${absolute(site, "/")}#podcast` },
    partOfSeason: season
      ? {
          "@type": "CreativeWorkSeason",
          name: `Season ${season}`,
          seasonNumber: season,
          url: absolute(site, `/${categories[0]}/`),
        }
      : undefined,
    episodeNumber: episodeNumber(data.slug),
    datePublished: data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date,
    inLanguage: data.language || site.locale || "en",
    image: absolute(site, data.image || site.cover),
    creator: (data.creators || site.people.creators).map(person),
    author: (data.hosts || site.people.hosts).map(person),
    contributor: (data.contributors || []).map(person),
    producer: (data.producers || site.people.producers).map(person),
    publisher: { "@id": `${absolute(site, "/")}#organization` },
    productionCompany: { "@id": `${absolute(site, "/")}#organization` },
    keywords: (data.tags || []).join(", "),
    about: (data.tags || []).map((tag) => ({ "@type": "Thing", name: tag, url: absolute(site, `/tags/${slugify(tag)}/`) })),
    genre: "Podcast episode",
    encodingFormat: data.format || "audio/mpeg",
    duration: data.duration,
    associatedMedia: embedUrl
      ? {
          "@type": "AudioObject",
          embedUrl,
          encodingFormat: "audio/mpeg",
        }
      : undefined,
    hasPart: data.transcript_pdf
      ? {
          "@type": "DigitalDocument",
          name: `${data.title} transcript`,
          url: absolute(site, data.transcript_pdf),
          encodingFormat: "application/pdf",
        }
      : undefined,
    citation: [
      absolute(site, `/assets/citations/${data.slug}.ris`),
      absolute(site, `/assets/citations/${data.slug}.csl.json`),
    ],
    license: data.rights?.url || site.rights.url,
    copyrightHolder: { "@id": `${absolute(site, "/")}#organization` },
    copyrightNotice: data.rights?.text || site.rights.text,
    isAccessibleForFree: true,
  });
}

function webPage(site, data, pageUrl, isEpisode) {
  return compact({
    "@type": "WebPage",
    "@id": `${absolute(site, pageUrl)}#webpage`,
    url: absolute(site, pageUrl),
    name: data.title || site.title,
    description: data.description || data.excerpt || site.description,
    isPartOf: { "@id": `${absolute(site, "/")}#website` },
    publisher: { "@id": `${absolute(site, "/")}#organization` },
    breadcrumb: { "@id": `${absolute(site, pageUrl)}#breadcrumb` },
    primaryImageOfPage: data.image
      ? {
          "@type": "ImageObject",
          url: absolute(site, data.image),
        }
      : undefined,
    mainEntity: isEpisode ? { "@id": `${absolute(site, pageUrl)}#podcast-episode` } : { "@id": `${absolute(site, "/")}#podcast` },
  });
}

export function buildJsonLd(data) {
  const site = data.site;
  const pageUrl = data.page?.url || "/";
  const isEpisode = data.layout === "post";
  const graph = [
    organization(site),
    webSite(site),
    podcastSeries(site),
    webPage(site, data, pageUrl, isEpisode),
    breadcrumbList(site, data, pageUrl),
  ];

  if (isEpisode) {
    graph.push(podcastEpisode(site, data, pageUrl));
  }

  return `${JSON.stringify({ "@context": "https://schema.org", "@graph": compact(graph) }, null, 2)}\n`;
}
