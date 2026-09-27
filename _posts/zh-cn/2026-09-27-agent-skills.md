---
layout: post
title: Agent Skills
description: 我开发与维护的 Agent 技能库，独立仓库管理，开箱即用。
date: 2026-09-27
lang: zh-cn
page_id: agent-skills
permalink: /blog/agent-skills/
sitemap: true
---

这里记录我日常开发与维护的 Agent Skills。

## [英文论文 PDF 翻译](https://github.com/NonTrivialLiu/english-paper-pdf-translation)

将英文论文 PDF 完整翻译为中文 PDF，并提供可编译的 LaTeX 源码。图表、公式及参考文献均与原刊版面严格对齐。

> 推荐用 DeepSeek API + Codex，或者 [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness) 来翻。别用 GPT，否则会很不幸——不讲人话。模型选 `DeepSeek-V4.1-Flash`，Pro 太贵没必要。

{% include figure.liquid path="assets/img/paper-translation-layout-comparison.png" title="SEED-SET 论文中英版面对照" class="img-fluid rounded z-depth-1" zoomable=true %}

## [MinerU 文档解析](https://github.com/NonTrivialLiu/MinerU-Skill)

将 PDF、Office 文档及图片解析为 Markdown。无损保留公式与图表，并自动在同级生成同名文件夹归档资源。（基于 [Nebutra/MinerU-Skill](https://github.com/Nebutra/MinerU-Skill) 二次开发，新增同名目录输出功能）
