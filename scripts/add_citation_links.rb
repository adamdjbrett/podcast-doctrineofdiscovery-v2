#!/usr/bin/env ruby
# frozen_string_literal: true

require 'fileutils'

# Find all markdown files in _posts
posts_dir = File.join(__dir__, '..', '_posts')
citation_include = "\n{% include citation-links.html %}"

Dir.glob(File.join(posts_dir, '**', '*.md')).each do |file_path|
  content = File.read(file_path)
  
  # Skip if already has the include
  next if content.include?('{% include citation-links.html %}')
  
  # Find citation section (## Citation or ### Citation)
  if content =~ /(##+ Citation\n[^\n]+\n)/
    citation_match = Regexp.last_match(1)
    # Add include after the citation text
    new_content = content.sub(citation_match, citation_match + citation_include)
    
    File.write(file_path, new_content)
    puts "Updated: #{file_path}"
  end
end

puts "Citation links added to all posts with ## Citation sections."
