---
layout: page
permalink: /publications/
title: 论文
lang: zh-cn
page_id: publications
description: 刘非凡（NonTrivialLiu）的研究论文，涵盖无人机语音增强与端侧部署。
nav: true
nav_order: 2
---

<!-- _pages/publications.md -->

<!-- Bibsearch Feature -->

{% include bib_search.liquid %}

<div class="publications">

{% bibliography --query @*[selected=true]* %}

</div>
