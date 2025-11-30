#!/usr/bin/env ruby
require 'fileutils'
require 'json'

POSTS_DIR = '_posts'
CITATIONS_DIR = 'assets/citations'
FileUtils.mkdir_p(CITATIONS_DIR)

# Helper: extract citation string from markdown
def extract_citation_string(file)
  content = File.read(file)
  # Find the citation section
  if content =~ /## Citation\s*\n(.*?)(^## |\z)/m
    block = $1.strip
    # Use the first non-empty line as the citation string
    block.each_line do |line|
      line = line.strip
      return line unless line.empty?
    end
  end
  nil
end

# Helper: parse citation string into fields
# Example: Philip P. Arnold and Sandra Bigtree, "S05E07: Indigenous Wisdom for Planetary Healing with Yuria Celidwen," _Mapping the Doctrine of Discovery_ (Podcast), March 26, 2025. <https://podcast.doctrineofdiscovery.org/season5/episode-07/>.
def parse_citation_string(cite)
  # Regex to extract: authors, title, container, date, url
  # Authors: up to first comma
  # Title: in double quotes
  # Container: in _underscores_ or (Podcast)
  # Date: after last comma before <url>
  # URL: in <...>
  m = cite.match(/^(.*?)\,\s*"([^"]+)"\,\s*_([^_]+)_\s*\(Podcast\)\,\s*([^<]+)\s*<([^>]+)>/)
  unless m
    # fallback: try to extract at least author, title, url
    m = cite.match(/^(.*?)\,\s*"([^"]+)".*<([^>]+)>/)
    return {
      'authors' => m ? m[1] : nil,
      'title' => m ? m[2] : nil,
      'container' => nil,
      'date' => nil,
      'url' => m ? m[3] : nil
    }
  end
  {
    'authors' => m[1],
    'title' => m[2],
    'container' => m[3],
    'date' => m[4].strip.gsub(/\.$/, ''),
    'url' => m[5]
  }
end

# Helper: split authors string into array
def parse_authors(authors_str)
  return [] unless authors_str
  # Split on ' and ' or ','
  authors_str.split(/\s+and\s+|,\s*/).map(&:strip).reject(&:empty?)
end

# Helper: generate RIS
def write_ris_file(slug, fields)
  ris = "TY  - SOUND\n"
  Array(fields['authors']).each { |a| ris << "AU  - #{a}\n" }
  ris << "TI  - #{fields['title']}\n" if fields['title']
  ris << "T2  - #{fields['container']}\n" if fields['container']
  ris << "DA  - #{fields['date']}\n" if fields['date']
  ris << "UR  - #{fields['url']}\n" if fields['url']
  ris << "ER  -\n"
  File.write(File.join(CITATIONS_DIR, "#{slug}.ris"), ris)
end

# Helper: generate CSL-JSON
def write_csl_json_file(slug, fields)
  authors = Array(fields['authors']).map do |a|
    # Try to split into family/given
    if a.include?(',')
      family, given = a.split(',', 2).map(&:strip)
      { 'family' => family, 'given' => given }
    else
      parts = a.split
      family = parts.pop
      given = parts.join(' ')
      { 'family' => family, 'given' => given }
    end
  end
  csl = {
    'type' => 'song',
    'id' => slug,
    'title' => fields['title'],
    'container-title' => fields['container'],
    'author' => authors,
    'URL' => fields['url'],
    'issued' => fields['date'] ? { 'raw' => fields['date'] } : nil
  }.delete_if { |_,v| v.nil? || v == [] }
  File.write(File.join(CITATIONS_DIR, "#{slug}.csl.json"), JSON.pretty_generate(csl))
end

# Main: process all posts
count = 0
Dir.glob("#{POSTS_DIR}/**/*.md").each do |file|
  cite_str = extract_citation_string(file)
  next unless cite_str
  fields = parse_citation_string(cite_str)
  fields['authors'] = parse_authors(fields['authors'])
  slug = File.basename(file, ".md")
  write_ris_file(slug, fields)
  write_csl_json_file(slug, fields)
  count += 1
end

puts "Generated #{count} citation(s) in #{CITATIONS_DIR}/"