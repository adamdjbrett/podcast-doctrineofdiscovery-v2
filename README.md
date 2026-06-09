[![Deploy 11ty to XMIT](https://github.com/adamdjbrett/podcast-doctrineofdiscovery-v2/actions/workflows/xmit-deploy.yml/badge.svg?branch=main)](https://github.com/adamdjbrett/podcast-doctrineofdiscovery-v2/actions/workflows/xmit-deploy.yml)

[![hosted on xmit.co](xmit.gif)](https://xmit.co)

# Mapping the Doctrine of Discovery Podcast

The official website repository for the Mapping the Doctrine of Discovery Podcast.

[Listen now](https://podcast.doctrineofdiscovery.org/)

## Build

This site is built with Eleventy and Liquid templates.

```sh
npm install
npm run build
npm test
```

The build writes to `_site/`. The build also generates citation downloads and `podcast.xml` after Eleventy finishes. `podcast.xml` is built from Buzzsprout when the network is available and falls back to `scripts/cache/buzzsprout-feed.xml` for offline or restricted builds.

`npm test` runs the production build plus checks for required pages, ESM-only project code, feeds, referenced assets, internal links, redirects, tag pages, episode metadata, citations, and PDF metadata.

PDF metadata checks use `pdfinfo` and `qpdf`. Updating PDF metadata uses Ghostscript through `npm run update:pdf-metadata`.

## Source Layout

- `src/` contains Eleventy pages, layouts, includes, and data.
- `src/_config/` contains Eleventy config modules for filters, collections, global data, Markdown setup, URL helpers, and passthrough copy.
- `src/common/` contains generated common outputs such as feeds, sitemap, robots, redirects, and humans.txt.
- `src/content/episodes/` contains podcast episode posts.
- `src/content/authors/` contains author profiles.
- `src/_data/site.yml` contains site metadata that used to live in the legacy root `_config.yml`.
- `public/` contains static files copied to the site root, including `/assets/...`.
- `scripts/` contains Node build helpers and verification checks.

## Checks

```sh
npm run check:esm
npm run check:build
npm run check:feeds
npm run check:assets
npm run check:links
npm run check:redirects
npm run check:metadata
npm run check:citations
npm run check:pdfs
```

The asset check reports large public files for review. It currently flags `public/assets/pdfs/Episode-05-Doctrine-of-Discovery-Abya-Yala-Tupac-Enrique-Acosta.pdf` as the largest reviewed file.

## URLs and Tags

Canonical tag pages live at `/tags/` and `/tags/{slug}/`, for example `/tags/haudenosaunee/`. Old `/tag`, `/tag.html`, and special episode paths such as `/special/episode-06/` generate redirect pages to the canonical paths. Search Console URL variants are handled through redirects when they represent legacy HTML or asset filenames.

Special episodes use `/special/s01/` through `/special/s08/`.

## Metadata

Episode pages render `h-entry` markup and all 15 Dublin Core elements: title, creator, subject, description, publisher, contributor, date, type, format, identifier, source, language, relation, coverage, and rights. Site identity, author pages, and episode author references use h-card markup.

Default podcast metadata is defined in `scripts/site-data.mjs` and can be overridden in episode front matter with fields such as `guests`, `contributors`, `duration`, `transcript_pdf`, `coverage`, `source`, and `relations`.

Citation downloads are generated for every episode as RIS and CSL JSON under `/assets/citations/`. PDF metadata is updated from the episode model and should include title, subject, author, keywords, CC-BY 4.0 rights text, the license URL, and basic bookmarks.

## Deployment

GitHub Actions install Node 22 plus Ghostscript, Poppler, and qpdf, then build and verify the site with `npm test`. Successful runs deploy the generated `_site/` directory to Cloudflare Workers and XMIT.

## Notes

This site began from a Stackbit Podcaster theme and later a Jekyll version. The current build is an Eleventy migration that preserves the public URL structure and visual output of the previous site.

## License

See [LICENSE](LICENSE).
