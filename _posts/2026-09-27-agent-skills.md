---
layout: post
title: Agent Skills
description: Agent Skills I develop and maintain. Open-sourced and ready to use.
date: 2026-09-27
lang: en
page_id: agent-skills
permalink: /blog/agent-skills/
sitemap: true
---

Agent Skills I build and maintain for daily workflows.

## [English-to-Chinese Paper PDF Translation](https://github.com/NonTrivialLiu/english-paper-pdf-translation)

Translates English paper PDFs into Chinese PDFs and provides compilable LaTeX source code. Figures, formulas, and references are strictly aligned with the original layout.

> Recommended to translate using DeepSeek API + Codex, or [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness). Avoid GPT, or you'll have a bad time—it sounds completely unnatural. Select the `DeepSeek-V4.1-Flash` model; Pro is too expensive and unnecessary.

{% include figure.liquid path="assets/img/paper-translation-layout-comparison.png" title="Layout comparison of the SEED-SET paper (English vs. Chinese)" class="img-fluid rounded z-depth-1" zoomable=true %}

## [MinerU Document Parsing](https://github.com/NonTrivialLiu/MinerU-Skill)

Parses PDFs, Office documents, and images into Markdown. Losslessly retains formulas and figures, automatically generating a same-named folder to archive assets. (Forked from [Nebutra/MinerU-Skill](https://github.com/Nebutra/MinerU-Skill) with added support for same-named directory output.)
