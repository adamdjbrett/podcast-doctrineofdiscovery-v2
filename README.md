[![Deploy 11ty to Cloudflare Workers](https://github.com/adamdjbrett/podcast-doctrineofdiscovery-v2/actions/workflows/cloudflare-deploy.yml/badge.svg)](https://github.com/adamdjbrett/podcast-doctrineofdiscovery-v2/actions/workflows/cloudflare-deploy.yml)[![Check PDF Metadata](https://github.com/adamdjbrett/podcast-doctrineofdiscovery-v2/actions/workflows/pdf-checks.yml/badge.svg)](https://github.com/adamdjbrett/podcast-doctrineofdiscovery-v2/actions/workflows/pdf-checks.yml) 
[![Built with Cloudflare](https://workers.cloudflare.com/built-with-cloudflare.svg)](https://cloudflare.com)
***

# Mapping the Doctrine of Discovery Podcast

The official website repository for the Mapping the Doctrine of Discovery Podcast.

[Listen now](https://podcast.doctrineofdiscovery.org/)

## Build

This site is built with [Build Awesome](https://build.awesome.me/) (Eleventy) and Liquid templates. Config lives in `buildawesome.config.js`.

```sh
npm install
npm run build
npm test
```

Local preview runs on <http://localhost:8080/> either way:

```sh
npm run dev
npx @awesome.me/buildawesome --serve
```

The build writes to `_site/`. The build also generates citation downloads and `podcast.xml` after Eleventy finishes. `podcast.xml` is built from Buzzsprout when the network is available and falls back to `scripts/cache/buzzsprout-feed.xml` for offline or restricted builds.

Site data (episodes, authors, pages, categories, tags) is assembled once by `scripts/site-data.mjs` and cached as JSON in `.cache/site-data.json` by `scripts/site-data-cache.mjs`. The cache is keyed on a fingerprint of every source file the builder reads, so edits invalidate it automatically and the config plus each postbuild/check script reuses the parse instead of re-walking `src/`. `npm run clean` removes `_site/` only; delete `.cache/` by hand if you ever need a forced rebuild.

Dependency install scripts are gated by the `allowScripts` field in `package.json` (npm 11.9+). `esbuild`, `fsevents`, and `workerd` are approved because they unpack platform binaries. `sharp` is denied: it arrives only through `miniflare` (a `wrangler` dependency this project does not run), its prebuilt `@img/sharp-*` binary installs regardless, and its install script tries a from-source libvips build on machines that have Homebrew libvips.

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
npm run check:headers
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

GitHub Actions run on Node 24.14.0, matching `.node-version` and the `engines.node` floor in `package.json`.

- `cloudflare-deploy.yml` runs `npm ci` and `npm run test:deploy`, then deploys the generated `_site/` directory to Cloudflare Workers.
- `pdf-checks.yml` installs Poppler and qpdf and runs `npm run check:pdfs` when PDFs or the scripts that verify them change.

Cloudflare Workers static assets allow at most 100 `_headers` rules. `scripts/postbuild-headers.mjs` generates four wildcard rules, and `npm run check:headers` enforces that ceiling:

1. `/*.xml` — canonical `Link` for the feeds.
2. `/season:season/*` — one rule covering every season via the `:season` placeholder.
3. `/special/*` — the one non-season episode category.
4. `/*metadata.json` — `application/ld+json`, plus `! Link` to strip the episode Signposting links from the JSON-LD documents themselves.

Each episode rule emits its three Signposting link-values as a single comma-separated `Link` field (RFC 8288), which is how Cloudflare serves them anyway, so a rule costs one header entry rather than three. Rule order matters: `/*metadata.json` must stay last for its `! Link` to unset what the episode rules added. PDF and citation metadata lives in the generated PDF/RIS/CSL JSON files rather than per-file HTTP headers. `wrangler.toml` does not define a build command; CI deploys the already-built and verified `_site` directory.

## Notes

This site began from a Stackbit Podcaster theme and later a Jekyll version. The current build is an Eleventy migration that preserves the public URL structure and visual output of the previous site.

## License

See [LICENSE](LICENSE).
