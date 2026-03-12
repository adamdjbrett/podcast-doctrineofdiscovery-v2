# frozen_string_literal: true

require "net/http"
require "uri"
require "rexml/document"
require "rexml/formatters/default"

module Jekyll
  module PodcastFeed
    SOURCE_FEED_URL = "https://feeds.buzzsprout.com/1926214.rss"
    OUTPUT_FILENAME = "podcast.xml"
    ITEM_IMAGE_PATH = "/assets/img/mapping-doctrine-of-discovery-favicon.png"
    XSL_HREF_PATH = "/assets/xsl/podcast-feed.xsl"

    def self.site_url(site)
      (site.config["url"] || "").to_s.sub(%r{/\z}, "")
    end

    def self.absolute_image_url(site)
      "#{site_url(site)}#{ITEM_IMAGE_PATH}"
    end

    def self.fetch_feed_xml(url = SOURCE_FEED_URL, limit = 5)
      raise "Too many redirects while fetching source feed" if limit <= 0

      uri = URI.parse(url)
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = (uri.scheme == "https")
      http.read_timeout = 25
      http.open_timeout = 10
      request = Net::HTTP::Get.new(uri.request_uri, { "User-Agent" => "JekyllPodcastFeedGenerator/1.0" })
      response = http.request(request)

      if response.is_a?(Net::HTTPRedirection)
        location = response["location"]
        raise "Redirect response missing Location header from #{url}" if location.to_s.strip.empty?
        redirect_url = URI.join(url, location).to_s
        return fetch_feed_xml(redirect_url, limit - 1)
      end

      unless response.is_a?(Net::HTTPSuccess)
        raise "Unable to fetch source feed (#{response.code} #{response.message}) from #{SOURCE_FEED_URL}"
      end
      response.body
    end

    def self.ensure_media_namespace(rss_root)
      rss_root.add_namespace("media", "http://search.yahoo.com/mrss/") unless rss_root.namespace("media")
    end

    def self.replace_self_atom_link(channel, href)
      channel.elements.to_a.each do |element|
        next unless element.prefix == "atom" && element.name == "link"
        next unless element.attributes["rel"] == "self"
        channel.delete_element(element)
      end

      atom_link = REXML::Element.new("atom:link")
      atom_link.add_attributes(
        "href" => href,
        "rel" => "self",
        "type" => "application/rss+xml"
      )
      channel.add_element(atom_link)
    end

    def self.inject_item_images(channel, image_url)
      channel.elements.each("item") do |item|
        item.elements.to_a.each do |element|
          if element.prefix == "itunes" && element.name == "image"
            item.delete_element(element)
          elsif element.prefix == "media" && element.name == "thumbnail"
            item.delete_element(element)
          end
        end

        itunes_image = REXML::Element.new("itunes:image")
        itunes_image.add_attribute("href", image_url)
        item.add_element(itunes_image)

        media_thumbnail = REXML::Element.new("media:thumbnail")
        media_thumbnail.add_attribute("url", image_url)
        item.add_element(media_thumbnail)
      end
    end

    def self.write_xml(document, output_path)
      body = +""
      formatter = REXML::Formatters::Default.new
      formatter.write(document, body)
      lines = body.lines
      if lines[0]&.lstrip&.start_with?("<?xml") && lines[1]&.lstrip&.start_with?("<?xml")
        lines.delete_at(1)
        body = lines.join
      end
      body = body.gsub(/^\s*<\?xml-stylesheet .*?\?>\s*\n?/m, "")

      if body.lstrip.start_with?("<?xml")
        body = body.sub(
          /\A(<\?xml[^>]*\?>\s*\n?)/,
          "\\1<?xml-stylesheet href=\"#{XSL_HREF_PATH}\" type=\"text/xsl\"?>\n"
        )
      else
        body = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<?xml-stylesheet href=\"#{XSL_HREF_PATH}\" type=\"text/xsl\"?>\n#{body}"
      end
      body << "\n"
      File.write(output_path, body)
    end
  end
end

Jekyll::Hooks.register :site, :post_write do |site|
  begin
    source_xml = Jekyll::PodcastFeed.fetch_feed_xml
    document = REXML::Document.new(source_xml)
    rss = document.root
    raise "Source feed is not an RSS document" unless rss && rss.name == "rss"

    Jekyll::PodcastFeed.ensure_media_namespace(rss)

    channel = rss.elements["channel"]
    raise "Source feed is missing <channel>" unless channel

    podcast_feed_url = "#{Jekyll::PodcastFeed.site_url(site)}/#{Jekyll::PodcastFeed::OUTPUT_FILENAME}"
    Jekyll::PodcastFeed.replace_self_atom_link(channel, podcast_feed_url)
    Jekyll::PodcastFeed.inject_item_images(channel, Jekyll::PodcastFeed.absolute_image_url(site))

    output_path = File.join(site.dest, Jekyll::PodcastFeed::OUTPUT_FILENAME)
    Jekyll::PodcastFeed.write_xml(document, output_path)
    Jekyll.logger.info "Podcast feed:", "Generated #{Jekyll::PodcastFeed::OUTPUT_FILENAME} from #{Jekyll::PodcastFeed::SOURCE_FEED_URL}"
  rescue StandardError => e
    Jekyll.logger.error "Podcast feed:", e.message
    raise e
  end
end
