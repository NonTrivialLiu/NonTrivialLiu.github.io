# 刘非凡个人博客：SEO 与 GEO 运维

本站以可核查的身份、研究成果和工程实践服务读者。SEO 负责页面发现与准确收录；GEO 关注内容在生成式搜索中的可理解性和引用表现。搜索结果与 AI 引用以各平台的实际数据为准。

## 身份与研究方向

| 资料           | 当前依据                                                                                                  | 更新入口                                                                                                                        |
| -------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 姓名与网络身份 | 刘非凡、Feifan Liu、GitHub 用户名 NonTrivialLiu 指向同一人                                                | `_config.yml` 的姓名与英文摘要、`_data/zh-cn/i18n.yml` 的中文摘要、两份首页资料卡、`_includes/head.liquid` 的 Person 结构化数据 |
| 学历与机构     | 浙江大学 ZJU-UIUC 联合学院（ZJUI）电子信息专业硕士在读；河南大学自动化专业学士                            | 两份首页资料卡与 Person 结构化数据；学位信息由本人确认                                                                          |
| 个人主页       | [GitHub][github-profile]、[ORCID][orcid-profile]、[SciProfiles][sciprofiles-profile]                      | `_data/socials.yml` 保存公开链接，Person 的 `sameAs` 指向相同地址                                                               |
| 外部报道       | [EEWorld 的 STM32 嵌入式大赛报道][stm32-feature]记载河南大学“一飞冲天”赛队及刘非凡负责 STM32 微控制器编程 | 中英文首页资料卡链接报道；本科工程经历以原文核对                                                                                |
| 研究主题       | AI Agent、电力系统、软硬件协同与各篇文章的具体问题                                                        | 站点摘要、页面 `description`、文章标题与正文；主题变化由真实工作和用户定稿内容驱动                                              |

身份识别结合姓名、院校经历、独立标识符与本人控制的页面。新增 Google Scholar、LinkedIn 等主页时，先核实归属，再同步维护社交链接与 Person 的 `sameAs`；ZJUI 个人主页以实际存在的官方地址为准。

## 页面发现与内容质量

| 页面类型                                     | 现行收录方式                                                                                                         | 内容更新要点                                                                                                       |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 首页、文章列表、论文列表、开源列表与真实文章 | 根目录 `sitemap.xml` 列出规范网址；成对页面各有 canonical 与 hreflang                                                | 每个页面使用准确的标题、摘要和可访问的内部链接；中英文配对规则见 [双语维护](I18N.md)                               |
| 模板演示页面                                 | front matter 的 `sitemap: false` 同时使页面退出地图，并由 `_includes/head.liquid` 输出 `noindex`；页面仍可供读者浏览 | 演示条目改成个人成果时，移除该字段，核对作者、日期、配图和来源                                                     |
| 语言回退与归档                               | 回退页、分页和归档页输出 `noindex`；简中独立译文指向自己的规范网址                                                   | 单语文章保持真实语言标记；新增双语版本时核对两端的互指关系                                                         |
| 论文与 PDF                                   | `_bibliography/papers.bib` 中 `selected: true` 的本人论文进入论文列表；DOI、出版社页面与 PDF 提供原始依据            | 核对作者顺序、题名、摘要、出版日期与 PDF 权利；独立论文页面可按 [Google Scholar 收录指南][scholar]展示完整作者摘要 |
| 互动译文                                     | 博客文章提供标题、摘要、原文与许可链接；内嵌互动资源独立使用 `noindex`                                               | 保留译者身份与原作者归属，搜索预览采用博客文章可见文字                                                             |

`robots.txt` 向爬虫提供地图地址。站点地图负责发现，canonical 与 `noindex` 负责规范归属；[Google 的多语言规则][google-i18n]和[索引控制规则][google-noindex]用于校验生成结果。新建真实文章默认具备收录资格，探索性页面可显式设置 `sitemap: false`。

页面内容以实际经验、方法、结果与限制为主，必要时链接论文、代码和数据。标题与 `description` 使用读者能理解的自然表述，图片提供描述性替代文本。Google 对标题和摘要采用设备相关的截断方式，[没有固定字符上限][google-title]；`meta keywords` [不参与 Google 网页排名][google-keywords]。

## 社交预览与页面性能

`_includes/head.liquid` 从页面标题、摘要、`og_image` 生成 Open Graph 与 Twitter 卡片，并根据当前语言生成分享网址。站点默认图片为 `_config.yml` 指定的形象照；文章可以在 front matter 设置专属配图。发布时用页面源码检查标题、摘要、图片绝对网址与语言，分享平台的实际裁切效果以平台预览为准。

面向移动端查看首页、论文卡片和互动文章，使用浏览器 Lighthouse 检查加载性能与可访问性。图片尺寸、替代文本和互动资源的加载成本按实际页面诊断；通用优化方法见[模板 SEO 指南](SEO.md#performance--mobile)。

## 搜索平台

| 平台   | 站点接入                                                                                                                                                 | 观察指标                                                                       |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Google | 在 [Search Console][gsc] 添加 `https://nontrivialliu.github.io/` 的网址前缀资源，采用 HTML 文件或元标签验证，提交 `/sitemap.xml`，抽检两种语言的关键网址 | 收录状态、搜索查询、展示与点击、核心网页指标，以及生成式搜索报告               |
| 百度   | 在[百度搜索资源平台][baidu-site]验证站点，提交规范地图并检查真实抓取；新文章可使用[链接提交][baidu-submit]                                               | 索引量、抓取异常、中文查询与页面访问质量；链接提交促进发现，收录以平台结果为准 |
| 必应   | 在 [Bing Webmaster Tools][bing-webmaster]验证站点并提交地图；高频更新场景可接入 IndexNow                                                                 | 搜索表现与 [AI Performance][bing-ai] 中的引用页面、主题及趋势                  |

GitHub Pages 的 `github.io` 域名采用站点文件或元标签完成所有权验证。元标签使用 `_config.yml` 中对应的验证码与 `enable_google_verification`、`enable_bing_verification` 开关；账户验证和报表查看由站点所有者执行。百度在中国大陆的抓取质量以其平台诊断为准。

## 生成式搜索

[Google 的生成式搜索指南][google-ai]将传统 SEO、可索引页面和可显示摘要作为基础；Google 搜索采用 Googlebot。必应与 Copilot 共享抓取、索引和质量基础，具体页面的引用情况由其站长平台观察。[OpenAI 官方爬虫说明][openai-bots]区分 ChatGPT 搜索的 `OAI-SearchBot` 与模型训练的 `GPTBot`；[Claude][claude-bots]和 [Perplexity][perplexity-bots]同样分别说明搜索抓取用途。当前 `robots.txt` 允许公开页面被抓取；模型训练授权可按站点所有者的选择独立配置。

生成式搜索更容易核查具备明确问题、作者、日期、证据链接和独立结论的页面。文章围绕实际研究与工程实践展开，引用 DOI、代码和原始资料。Google 搜索[无需专用 `llms.txt`、AI 标记或固定分块][google-ai]；站点内容和搜索平台反馈决定投入方向。

## 本地验收与持续维护

Mac 上的 Docker 预览、生产构建与 GitHub 发布检查见 [AGENTS.md](../AGENTS.md#本地预览与发布)。SEO 专项测试在仓库根目录执行：

```bash
docker compose exec -T jekyll bash test/integration_seo.sh
```

测试核对人物资料、规范网址、地图唯一性、示例页面索引状态、论文归属与单语译文。上线后在三个站长平台分别查看首页、中文首页、论文页和新文章的抓取与收录；Bing AI Performance 与 Google 生成式搜索报告用于观察引用趋势。每次更新研究方向、学历、身份主页或论文时，先修改上表中的权威入口，再检查生成页面及对应平台数据。

[github-profile]: https://github.com/NonTrivialLiu
[orcid-profile]: https://orcid.org/0009-0004-7514-3994
[sciprofiles-profile]: https://sciprofiles.com/profile/feifan-liu
[stm32-feature]: https://news.eeworld.com.cn/mp/STM32/a294635.jspx
[google-i18n]: https://developers.google.com/search/docs/specialty/international/localized-versions
[google-noindex]: https://developers.google.com/search/docs/crawling-indexing/block-indexing
[google-title]: https://developers.google.com/search/docs/appearance/title-link
[google-keywords]: https://developers.google.com/search/blog/2009/09/google-does-not-use-keywords-meta-tag
[scholar]: https://scholar.google.com/intl/en/scholar/inclusion.html
[gsc]: https://search.google.com/search-console
[baidu-site]: https://ziyuan.baidu.com/site/index
[baidu-submit]: https://ziyuan.baidu.com/linksubmit/url
[bing-webmaster]: https://www.bing.com/webmasters
[bing-ai]: https://www.bing.com/webmasters/help/ai-performance-9f8e7d6c
[google-ai]: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
[openai-bots]: https://developers.openai.com/api/docs/bots
[claude-bots]: https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
[perplexity-bots]: https://docs.perplexity.ai/docs/resources/perplexity-crawlers
