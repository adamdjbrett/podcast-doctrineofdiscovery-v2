import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, RIGHTS } from "./site-data.mjs";

const pdfDir = path.join(ROOT, "public", "assets", "pdfs");
const failures = [];

for (const file of walk(pdfDir).filter((entry) => /\.pdf$/i.test(entry))) {
  const rel = path.relative(ROOT, file);
  const result = spawnSync("pdfinfo", [file], { encoding: "utf8" });
  if (result.status !== 0) {
    failures.push(`${rel}: pdfinfo failed`);
    continue;
  }
  const info = result.stdout;
  for (const field of ["Title:", "Subject:", "Author:", "Keywords:"]) {
    if (!info.includes(field)) {
      failures.push(`${rel}: missing ${field}`);
    }
  }
  if (!info.includes(RIGHTS.url) || !info.includes("Creative Commons")) {
    failures.push(`${rel}: missing CC-BY 4.0 rights URL/text`);
  }
  const outlines = spawnSync("qpdf", ["--json", "--json-key=outlines", file], { encoding: "utf8" });
  if (outlines.status !== 0 || !/"title"/.test(outlines.stdout)) {
    failures.push(`${rel}: missing outline/bookmark data`);
  }
}

if (failures.length) {
  console.error("PDF metadata checks failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("PDF metadata checks passed.");

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return walk(fullPath);
    }
    return [fullPath];
  });
}
