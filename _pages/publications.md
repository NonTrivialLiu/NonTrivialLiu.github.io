---
layout: page
permalink: /publications/
title: publications
lang: en
page_id: publications
description: Research publications by Feifan Liu (NonTrivialLiu), including edge-deployed UAV speech enhancement.
nav: true
nav_order: 2
---

<!-- _pages/publications.md -->

<!-- Bibsearch Feature -->

{% include bib_search.liquid %}

<div class="publications">

{% bibliography --query @*[selected=true]* %}

</div>
