// Identity of whatever actually built this site, for meta[name=generator] and
// the footer credit.
//
// The version comes from the installed package rather than the dependency range
// in package.json, so it stays true if the range is ever loosened to `^4.0.0`.
// Build Awesome's own `buildawesome.version` global is not used because it runs
// the version through semver coerce, which drops the prerelease qualifier and
// reports this alpha as a bare "4.0.0".

import fs from "node:fs";

const PACKAGE_NAME = "@awesome.me/buildawesome";
const DISPLAY_NAME = "Build Awesome";
const HOMEPAGE = "https://build.awesome.me/";

function installedVersion(rootUrl) {
  try {
    const manifest = new URL(`node_modules/${PACKAGE_NAME}/package.json`, rootUrl);
    return JSON.parse(fs.readFileSync(manifest, "utf8")).version;
  } catch {
    return undefined;
  }
}

function declaredVersion(packageJson) {
  const range = packageJson?.dependencies?.[PACKAGE_NAME] ?? packageJson?.devDependencies?.[PACKAGE_NAME];
  return range ? range.replace(/^[^\d]*/, "") : undefined;
}

export function resolveGenerator(rootUrl, packageJson) {
  const version = installedVersion(rootUrl) ?? declaredVersion(packageJson);
  return {
    name: DISPLAY_NAME,
    package: PACKAGE_NAME,
    url: HOMEPAGE,
    version,
    // "Build Awesome v4.0.0-alpha.10"
    label: version ? `${DISPLAY_NAME} v${version}` : DISPLAY_NAME,
  };
}
