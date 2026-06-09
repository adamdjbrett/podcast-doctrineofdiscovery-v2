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

`npm test` runs the production build plus checks for required pages, feeds, referenced assets, and internal links.

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
npm run check:build
npm run check:feeds
npm run check:assets
npm run check:links
```

The asset check reports large public files for review. It currently flags `public/assets/pdfs/Episode-05-Doctrine-of-Discovery-Abya-Yala-Tupac-Enrique-Acosta.pdf` as the largest reviewed file.

## Deployment

GitHub Actions build and verify the site with `npm test`, then deploy the generated `_site/` directory to Cloudflare Workers and XMIT.

## Notes

This site began from a Stackbit Podcaster theme and later a Jekyll version. The current build is an Eleventy migration that preserves the public URL structure and visual output of the previous site.

## License

See [LICENSE](LICENSE).
