<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <xsl:output method="html" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title><xsl:value-of select="/rss/channel/title" /></title>
        <style>
          body {
            background: #000;
            color: #fff;
            font-family: "Courier New", Courier, monospace;
            margin: 0;
            padding: 2rem;
            line-height: 1.5;
          }
          a { color: #fff; }
          .wrap { max-width: 980px; margin: 0 auto; }
          .meta { margin-bottom: 2rem; border-bottom: 1px solid #444; padding-bottom: 1rem; }
          .item { margin-bottom: 1.75rem; border-bottom: 1px solid #222; padding-bottom: 1rem; }
          h1, h2 { margin: 0 0 0.5rem 0; font-weight: 700; }
          p { margin: 0.35rem 0; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="meta">
            <h1><xsl:value-of select="/rss/channel/title" /></h1>
            <p><xsl:value-of select="/rss/channel/description" /></p>
            <p>
              <a href="{/rss/channel/link}">
                <xsl:value-of select="/rss/channel/link" />
              </a>
            </p>
          </div>

          <xsl:for-each select="/rss/channel/item">
            <div class="item">
              <h2><xsl:value-of select="title" /></h2>
              <p><strong>Date:</strong> <xsl:value-of select="pubDate" /></p>
              <xsl:if test="link">
                <p>
                  <strong>Episode:</strong>
                  <a href="{link}"><xsl:value-of select="link" /></a>
                </p>
              </xsl:if>
              <xsl:if test="enclosure/@url">
                <p>
                  <strong>Audio:</strong>
                  <a href="{enclosure/@url}"><xsl:value-of select="enclosure/@url" /></a>
                </p>
              </xsl:if>
            </div>
          </xsl:for-each>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
