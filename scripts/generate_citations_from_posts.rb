#!/usr/bin/env ruby
require 'fileutils'
require 'json'

POSTS_DIR = '_posts'
CITATIONS_DIR = 'assets/citations'
FileUtils.mkdir_p(CITATIONS_DIR)

# Helper: extract citation block from markdown
# Returns a hash of citation fields
# Assumes citation block is in YAML-like format under '## Citation'
def extract_citation_block(file)
  content = File.read(file)
  # Find the citation section
  if content =~ /## Citation\s*\n(.*?)(^## |\z)/m
    block = $1.strip
    # Parse YAML-like fields
    fields = {}
    block.each_line do |line|
      if line =~ /^([\w\-]+):\s*(.*)$/
        fields[$1.strip.downcase] = $2.strip
      end
    end
    return fields unless fields.empty?
  end
  nil
end

# Helper: generate RIS
# Minimal fields: title, author, year, url
def write_ris_file(slug, fields)
  ris = "TY  - JOUR\n"
  ris << "TI  - #{fields['title']}\n" if fields['title']
  ris << "AU  - #{fields['author']}\n" if fields['author']
  ris << "PY  - #{fields['year']}\n" if fields['year']
  ris << "UR  - #{fields['url']}\n" if fields['url']
  ris << "ER  -\n"
  File.write(File.join(CITATIONS_DIR, "#{slug}.ris"), ris)
end

# Helper: generate CSL-JSON
# Minimal fields: title, author, year, url
def write_csl_json_file(slug, fields)
  author_obj = if fields['author']
    parts = fields['author'].split
    family = parts.pop
    given = parts.join(' ')
    [{ 'family' => family, 'given' => given }]
  else
    []
  end
  csl = {
    'type' => 'article-journal',
    'id' => slug,
    'title' => fields['title'],
    'author' => author_obj,
    'URL' => fields['url'],
    'issued' => { 'date-parts' => [[fields['year'].to_i]] }
  }.delete_if { |_,v| v.nil? || v == [] || v == 0 }
  File.write(File.join(CITATIONS_DIR, "#{slug}.csl.json"), JSON.pretty_generate(csl))
end

# Main: process all posts
count = 0
Dir.glob("#{POSTS_DIR}/**/*.md").each do |file|
  fields = extract_citation_block(file)
  next unless fields
  slug = File.basename(file, ".md")
  write_ris_file(slug, fields)
  write_csl_json_file(slug, fields)
  count += 1
end

puts "Generated #{count} citation(s) in #{CITATIONS_DIR}/"
