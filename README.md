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
```

The build writes to `_site/`. The build also generates citation downloads and `podcast.xml` after Eleventy finishes.

## Source Layout

- `src/` contains Eleventy pages, layouts, includes, and data.
- `src/content/_posts/` contains podcast episode posts.
- `src/content/_authors/` contains author profiles.
- `public/` contains static files copied to the site root, including `/assets/...`.
- `scripts/` contains Node postbuild helpers for citation files, redirects, and the podcast feed.

## Deployment

GitHub Actions build the site with `npm run build` and deploy the generated `_site/` directory to Cloudflare Workers and XMIT.

## Notes

This site began from a Stackbit Podcaster theme and later a Jekyll version. The current build is an Eleventy migration that preserves the public URL structure and visual output of the previous site.

## License

See [LICENSE](LICENSE).
