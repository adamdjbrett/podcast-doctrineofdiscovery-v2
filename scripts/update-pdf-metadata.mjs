import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, PODCAST_PEOPLE, RIGHTS, readPosts } from "./site-data.mjs";

const pdfDir = path.join(ROOT, "public", "assets", "pdfs");
const postsByPdf = new Map(readPosts().filter((post) => post.transcript_pdf).map((post) => [decodeURI(post.transcript_pdf.replace(/^\/assets\/pdfs\//, "")), post]));

for (const file of walk(pdfDir).filter((entry) => /\.pdf$/i.test(entry))) {
  const rel = path.relative(pdfDir, file).split(path.sep).join("/");
  const post = postsByPdf.get(rel);
  const title = post ? `${post.title} Transcript` : titleFromFilename(rel);
  const description = post?.description || "Mapping the Doctrine of Discovery Podcast PDF resource.";
  const author = post ? post.creators.map((person) => person.name).join("; ") : PODCAST_PEOPLE.creators.map((person) => person.name).join("; ");
  const keywords = [
    ...(post?.tags || []),
    "Mapping the Doctrine of Discovery Podcast",
    "Doctrine of Discovery",
    RIGHTS.label,
    RIGHTS.url,
  ].join("; ");
  const subject = `${description} ${RIGHTS.text} ${RIGHTS.url}`;
  rewritePdf(file, { title, author, subject, keywords, url: post ? `https://podcast.doctrineofdiscovery.org${post.url}` : "https://podcast.doctrineofdiscovery.org/" });
}

console.log("Updated PDF metadata.");

function rewritePdf(file, meta) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "podcast-pdf-"));
  const pdfmark = path.join(tempDir, "metadata.pdfmark");
  const out = path.join(tempDir, "out.pdf");
  fs.writeFileSync(
    pdfmark,
    [
      `[ /Title ${pdfString(meta.title)} /Author ${pdfString(meta.author)} /Subject ${pdfString(meta.subject)} /Keywords ${pdfString(meta.keywords)} /Copyright ${pdfString(`${RIGHTS.text} ${RIGHTS.url}`)} /Rights ${pdfString(`${RIGHTS.text} ${RIGHTS.url}`)} /DOCINFO pdfmark`,
      `[ /Title ${pdfString("Resource")} /Page 1 /OUT pdfmark`,
      `[ /Title ${pdfString("Canonical URL")} /Action /URI /URI ${pdfString(meta.url)} /OUT pdfmark`,
    ].join("\n")
  );
  const result = spawnSync("gs", ["-q", "-dBATCH", "-dNOPAUSE", "-sDEVICE=pdfwrite", `-sOutputFile=${out}`, file, pdfmark], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`Ghostscript failed for ${file}: ${result.stderr || result.stdout}`);
  }
  fs.copyFileSync(out, file);
  fs.rmSync(tempDir, { recursive: true, force: true });
}

function pdfString(value) {
  return `(${String(value || "").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")})`;
}

function titleFromFilename(file) {
  return path.basename(file, path.extname(file)).replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return walk(fullPath);
    }
    return [fullPath];
  });
}
