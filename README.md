[![Deploy Jekyll to XMIT](https://github.com/adamdjbrett/podcast-doctrineofdiscovery-v2/actions/workflows/xmit-deploy.yml/badge.svg?branch=main)](https://github.com/adamdjbrett/podcast-doctrineofdiscovery-v2/actions/workflows/xmit-deploy.yml)

# Mapping the Doctrine of Discovery Podcast
The official repository for our Podcast
[Listen Now](https://podcast.doctrineofdiscovery.org/)

## Description

This website uses the Podcaster theme originally developed by Stackbit but the theme and Stackbit support sunset in 2021.

## Getting Started

### Dependencies

* Jekyll ENV
* kramdown-parser-gfm
* Jekyll tagging
* webrick
* wdm
* jekyll-sitemap
* jekyll-feed
* jekyll-seo-tag
* jekyll-paginate
* jekyll-paginate-multiple


### Installing

* This is very much a project under revision.

### Executing program

* very carefully.

### Help

Proceed with caution. Unsupported repo.

### Authors

Contributors names and contact info
* Stackbit for the original version
* creativitas for porting in to Jekyll and keeping it alive.

### Version History

* 0.2
    * Jekyll transition
    * See [commit change](https://github.com/adamdjbrett/podcast-v2/commit/4c477b727b315abb31cbb746b6eb79a1878bb773) or See [release history](https://github.com/adamdjbrett/podcast-v2/commits/main)
* 0.1
    * Initial Release 
    * [archived theme]*

### License

see the [LICENSE](LICENSE) file for details

### Land Acknowledgments
We begin by acknowledging with respect the Onondaga Nation, Central Fire of the Haudenosaunee Confederacy, on whose ancestral lands we now inhabit. Wherever you are located be aware of the Indigenous Peoples on whose lands you reside. We are mindful that the technology that makes this conference possible comes from the mineral extraction by multinational corporations, which decimate and displace Indigenous people and their land all over the world. May the information you glean from this podcast motivate you to uphold Indigenous values, protect Mother Earth, Honor Indian Treaties and hold your government and various institutions accountable who stand in the way.

### Credits
Inspiration, code snippets, etc.
* [Stackbit](https://www.stackbit.com/)
* Creativitas

## CHANGELOG

+ Add Author Page.
+ Add Author Features.
+ Author Profile Detail.

Add new author create new author file name on `_authors` folder, and name it with your author.
example `adam.md`

## Author frontmatter

Use fontawesome icon just copy and paste example `fa-brands fa-github` in to icon section

## Change Note by on post
Open `_config.yml` file and change `notes` area

```
---
uid: adam
title: Adam DJ Brett 
description: "I’M A EDUCATOR, RESEARCHER, OPERATIONS MANAGER, AND A WEB DEVELOPER."
image: "https://avatars.githubusercontent.com/u/22662978?v=4"
social: 
 - icon: fa-brands fa-github
   title: Adam DJ Brett Github
   url: https://github.com/adamdjbrett
 - icon: fa-brands fa-twitter
   title: Adam DJ brett Twitter
   url: https://x.com/__adjb
 - icon: fa-brands fa-instagram
   title: Adam DJ brett Instagram
   url: https://instagram.com/__adjb
 - icon: fa-brands fa-linkedin
   title: Adam DJ brett Linked
   url: https://www.linkedin.com/in/adamdjbrett/
---
My article about me in here....
```

## Add author in to article

To add author you can add `author: {{uid}}` check your author `uid` in the `_author/{{authorname}}` example `adam` so you can add author like this `author: adam`


