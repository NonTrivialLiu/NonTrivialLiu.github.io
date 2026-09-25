# AGENTS.md：刘非凡个人博客维护指引

本仓库承载刘非凡的个人博客。站点使用 al-folio、Jekyll 与 Polyglot，内容、身份资料、双语页面和站点配置由本仓库维护；共享主题运行时由相应 gem 提供。每次任务依据用户请求选择下方入口，专题细节从对应文档加载。

```text
个人资料 / 文章 / 论文 / 项目 / 教学
                 │
                 ▼
          内容文件与数据文件
                 │
                 ▼
     Jekyll + Polyglot + 主题 gem
              ┌──┴──┐
              ▼     ▼
           英文页面  简中页面
```

## 工作起点

- 查看 `git status --short`、当前分支与目标文件，保留已有修改；改动范围以本次请求为准。
- 用户确认的稿件与资料决定内容表达；网页和附件提供核对线索，读者可见的措辞按本次授权处理。
- 外部服务凭据使用本机环境变量或 CI Secrets；提交、推送与发布依据本次授权执行。

## 内容与代码归属

| 任务                                         | 修改入口                                                               | 深入资料                                                                               |
| -------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 固定页面、导航、文章、动态、项目、教学、书评 | `_pages/`、`_posts/`、`_news/`、`_projects/`、`_teachings/`、`_books/` | [内容维护](docs/CUSTOMIZE.md)                                                          |
| GitHub 仓库展示                              | `_data/repositories.yml`、对应双语页面                                 | [内容维护](docs/CUSTOMIZE.md#modifying-the-user-and-repository-information)            |
| 论文、简历、社交资料与图片                   | `_bibliography/`、`_data/`、`assets/`                                  | [内容维护](docs/CUSTOMIZE.md)                                                          |
| 英文与简中配对、界面词条、语言路由           | 对应内容目录、`_data/en/`、`_data/zh-cn/`                              | [双语维护](docs/I18N.md)                                                               |
| 站点身份、功能开关与依赖                     | `_config.yml`、`Gemfile`、`Gemfile.lock`                               | [架构说明](docs/ARCHITECTURE.md)                                                       |
| 布局、组件与功能行为                         | 对应 al-folio gem；本站定制使用已登记的本地覆盖                        | [归属表](docs/BOUNDARIES.md) · [覆盖说明](docs/I18N.md#模板覆盖)                       |
| 构建检查与浏览器验收                         | `test/`、`package.json`                                                | [安装部署](docs/INSTALL.md) · [双语维护](docs/I18N.md#验证)                            |
| 发布、SEO 与运行故障                         | `.github/workflows/`、站点配置和相关文档                               | [安装部署](docs/INSTALL.md) · [SEO](docs/SEO.md) · [故障排查](docs/TROUBLESHOOTING.md) |

修改插件依赖时同步核对 `Gemfile`、`Gemfile.lock` 与 `_config.yml` 的 `plugins`；版本及开关以当前文件为准。

站点专属的 gem 模板与脚本覆盖由 `.al-folio-overrides.yml` 记录。修改覆盖时，对照已安装 gem 的上游文件，确认差异后更新清单，并运行 `docker compose exec -T jekyll bundle exec al-folio upgrade overrides audit --fail-on-stale`。共享功能的修复进入归属 gem。

## 内容质量

| 内容对象               | 核对重点                                                                                                                    |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 个人资料与公开信息     | 教育、任职、研究方向、社交入口和联系方式有用户资料或可靠来源支持；演示条目在发布前逐项确认展示范围。                        |
| 固定页面与导航         | `nav` 控制导航入口，页面文件保留独立访问；双语页面同步核对顺序、下拉项与目标地址的唯一性。                                  |
| 文章与集合条目         | 文件日期、front matter、`permalink`、站内链接和可见标题一致；公式、代码及 Liquid 标记可渲染。                               |
| 论文与简历             | 作者顺序、题名、期刊、DOI、BibTeX 键及 CV 数据与来源一致；引用元数据保持单一来源，`pdf`、`preview` 对应可访问的原文与配图。 |
| 图片、音视频与下载资源 | 路径可访问，替代文本描述内容，来源及使用权限可追溯。                                                                        |
| 双语页面               | `page_id` 与英文 slug 稳定，译文使用独立内容文件；词条与切换规则见 [双语维护](docs/I18N.md)。                               |
| 搜索与社交预览         | 标题、摘要、canonical、hreflang 和结构化数据以构建结果核对；配置入口见 [SEO](docs/SEO.md)。                                 |

> 发布内容以目标读者可见的页面为验收对象；构建成功同时需要页面链接、资源和元数据检查。

## 本地预览与发布

所有构建、测试和预览在 Mac 本地执行。运行 `docker compose up -d` 后访问英文首页 `http://127.0.0.1:8080/` 与简中首页 `http://127.0.0.1:8080/zh-cn/`；容器内构建输出位于 `/tmp/_site`。Python 辅助工作使用 `uv` 隔离依赖。

发布前核对 `_config.yml` 的 `url`、`baseurl` 与语言设置是否对应目标地址，以及 `.github/workflows/deploy.yml` 的触发条件与产物目录。站内链接沿用 Jekyll 的 `relative_url` 等过滤器。

发布后核对 GitHub Actions 的部署结果、公开站点的双语页面及关键资源；本地构建结果负责预检，线上响应负责发布验收。

运行态排查按照症状选择入口：

| 观察结果                         | 优先核对                                                   |
| -------------------------------- | ---------------------------------------------------------- |
| 某个功能没有输出                 | 插件加载、站点功能开关、页面 front matter 三层条件         |
| 简中页面地址或语言入口异常       | `page_id`、`permalink`、构建目录及 `docs/I18N.md`          |
| GitHub 仓库卡片缺失或信息滞后    | `_data/repositories.yml`、外部统计图片服务与浏览器加载状态 |
| 本地构建受外部文章源影响         | `test/polyglot_config.yml` 的离线构建配置                  |
| 修改 Ruby 插件后预览仍显示原行为 | Docker 容器重启状态与构建日志                              |

## 验证与交付

首次检出执行 `npm ci` 安装前端检查依赖；站点测试使用本地 Docker 容器内的 Bundler。依据改动范围选择检查：

| 改动范围                                  | 验证入口                                                                                                                           |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Markdown、YAML、Liquid、JavaScript 或文档 | `npm run lint:prettier`；涉及目录归属时加 `npm run lint:style-contract`                                                            |
| 双语内容、词条和路由                      | `docker compose exec -T jekyll bash test/integration_i18n.sh` 与 `docker compose exec -T jekyll bash test/integration_polyglot.sh` |
| 插件配置、模板覆盖、部署逻辑              | 对应 `test/integration_*.sh` 与站点构建；覆盖差异使用上文的审计命令                                                                |
| 可见界面或交互                            | 本地预览关键页面；相关场景使用 `npm run test:visual`                                                                               |

完成前检查差异与生成页面，交付说明列出实际执行的命令、验证结果和剩余限制。视觉快照更新依据预期界面变化执行。

## 指令维护

本文件保存跨任务的稳定约束与资料入口。专题事实由对应文档维护，任务进度留在任务记录与 Git 历史中；新增规则与现行代码、命令及检查机制同步核对。
