import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const SCAN_DIRS = ["src", "scripts"].map((dir) => path.join(ROOT, dir));
const SOURCE_ONLY_EXTENSIONS = new Set([".ai", ".psd", ".sketch", ".fig"]);
const LEGACY_REDIRECT_SOURCES = new Set([
  "/assets/pdfs/S02E01-Hidden-Roots-White-Supremacy-Robert-P-Jones-PRRI-TRANSCRIPT.pdf",
  "/assets/pdfs/S2E01–The-Backstory-of-Johnson-v-MIntosh-Lindsay-Robertson-TRANSCRIPT.pdf",
  "/assets/pdfs/S02E02-The-International-Dimensions-of-Johnson-v-M’Intosh-Robert-J-Miller-TRANSCRIPT.pdf",
]);
const REFERENCE_RE = /["'(`](\/(?:assets|site\.webmanifest|favicon\.ico|browserconfig\.xml)[^"'`) <>\n]*)/g;

const publicFiles = walk(PUBLIC_DIR);
const sourceOnly = publicFiles.filter((file) => SOURCE_ONLY_EXTENSIONS.has(path.extname(file).toLowerCase()));
const references = collectReferences(SCAN_DIRS);
const missing = [];

for (const ref of references) {
  if (ref.startsWith("/assets/citations/") || LEGACY_REDIRECT_SOURCES.has(ref)) {
    continue;
  }
  const cleanRef = decodeURIComponent(ref.split("#")[0].split("?")[0]).replace(/^\//, "");
  if (!fs.existsSync(path.join(PUBLIC_DIR, cleanRef))) {
    missing.push(ref);
  }
}

if (sourceOnly.length || missing.length) {
  if (sourceOnly.length) {
    console.error("Source-only assets found under public/:");
    for (const file of sourceOnly) {
      console.error(`- ${path.relative(ROOT, file)}`);
    }
  }
  if (missing.length) {
    console.error("Missing referenced public assets:");
    for (const ref of [...new Set(missing)].sort()) {
      console.error(`- ${ref}`);
    }
  }
  process.exit(1);
}

const largeFiles = publicFiles
  .map((file) => ({ file, size: fs.statSync(file).size }))
  .filter((entry) => entry.size > 1_000_000)
  .sort((a, b) => b.size - a.size);

if (largeFiles.length) {
  console.log("Large public assets to review:");
  for (const { file, size } of largeFiles) {
    console.log(`- ${path.relative(ROOT, file)} (${formatBytes(size)})`);
  }
}

console.log(`Asset check passed (${references.size} referenced public assets checked).`);

function collectReferences(dirs) {
  const refs = new Set();
  for (const dir of dirs) {
    for (const file of walk(dir)) {
      if (/\.(jpg|jpeg|png|webp|gif|svg|ico|pdf|woff2?)$/i.test(file)) {
        continue;
      }
      const text = fs.readFileSync(file, "utf8");
      for (const match of text.matchAll(REFERENCE_RE)) {
        refs.add(match[1]);
      }
    }
  }
  return refs;
}

function walk(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return walk(fullPath);
    }
    return [fullPath];
  });
}

function formatBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
