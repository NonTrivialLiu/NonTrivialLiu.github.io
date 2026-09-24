# Architecture (v1.x)

This describes how the personal site uses the `al-folio` v1 starter and its plugin gems. [`AGENTS.md`](../AGENTS.md) is the short entry point; [`BOUNDARIES.md`](BOUNDARIES.md) maps shared runtime ownership. Keep each technical fact in one authoritative location and link to it elsewhere.

<!--ts-->

- [Architecture (v1.x)](#architecture-v1x)
  - [What the starter is](#what-the-starter-is)
  - [Failure modes that produce no error message](#failure-modes-that-produce-no-error-message)
    - [1. Features fail silently when the gem or the flag is missing](#1-features-fail-silently-when-the-gem-or-the-flag-is-missing)
    - [2. Gemfile and \_config.yml are two lists that must agree](#2-gemfile-and-_configyml-are-two-lists-that-must-agree)
    - [3. This site's baseurl is empty](#3-this-sites-baseurl-is-empty)
  - [Wrapper to tag to gem delegation](#wrapper-to-tag-to-gem-delegation)
  - [How feature gems ship their assets](#how-feature-gems-ship-their-assets)
  - [The v1 config contract](#the-v1-config-contract)
  - [Local overrides](#local-overrides)
  - [Bootstrap compatibility is opt-in and time-boxed](#bootstrap-compatibility-is-opt-in-and-time-boxed)
  - [Working on a gem alongside the starter](#working-on-a-gem-alongside-the-starter)

<!--te-->

## What the starter is

`al-folio` v1.x supplies a thin Jekyll starter. This personal site repository owns:

- starter wiring (`Gemfile`, `_config.yml`, `_data/featured_plugins.yml`),
- personal and example content (`_pages`, `_posts`, `_projects`, `_news`, `_teachings`, `_books`, `_bibliography`),
- documentation (`docs/`),
- cross-gem integration tests (`test/integration_*.sh`) and visual parity tests (`test/visual/`),
- registered, site-specific overrides listed in `.al-folio-overrides.yml`.

**Shared runtime — layouts, includes, Sass, Liquid tags, filters, and feature JS — is owned by versioned gems** published independently on RubyGems and developed under the [`al-org-dev`](https://github.com/al-org-dev) organization.

Shared runtime changes belong in the owning gem. Site-specific layout and include overrides are registered in `.al-folio-overrides.yml`. See the routing table in [`AGENTS.md`](../AGENTS.md#内容与代码归属) and the ownership table in [`BOUNDARIES.md`](BOUNDARIES.md#bundled-v1-plugin-routing).

## Failure modes that produce no error message

These three are the reason most "I changed it and nothing happened" reports exist. None of them raises a build error.

### 1. Features fail silently when the gem or the flag is missing

Feature gating is **two-layered**, and a feature renders only when _both_ layers agree:

- **Site-wide config flags** in `_config.yml`: `search_enabled`, `enable_math`, `enable_cookie_consent`, `enable_darkmode`, `al_folio.features.cv.enabled`, `al_folio.features.distill.enabled`, and the provider IDs under `analytics:`.
- **Per-page front matter**: `images:`, `tikzjax`, `chart.*`, `mermaid.*`, `giscus_comments`, `layout: distill`, `layout: cv`.

`al_folio_core` ships thin wrappers in `_includes/plugins/*.liquid` that call custom Liquid tags defined by the sibling gems. **When the owning gem is not in the plugin list, or the flag is off, the tag emits an empty string.** There is no warning, no missing-tag error, and no visual placeholder — the feature simply is not there.

When debugging a feature that "does nothing", check in this order:

1. Is the gem in **both** the `Gemfile` and the `plugins:` list in `_config.yml`? (See below.)
2. Is the site-wide flag on?
3. Does the page's front matter opt in?
4. Is the relevant `third_party_libraries` entry present with its SRI hash?

### 2. Gemfile and `_config.yml` are two lists that must agree

Plugin activation requires **two edits, in two files**:

- [`Gemfile`](../Gemfile), `group :al_folio_plugins` — the pinned dependency and its current released version.
- [`_config.yml`](../_config.yml), the `plugins:` list — the Jekyll activation entry.

A gem present in only one of them is inert. In the `Gemfile` only, Jekyll never loads it; in `plugins:` only, Bundler never installs it. Adding **or removing** a plugin means editing both. Note the spelling difference: repo directories use hyphens (`al-folio-core`), gem and plugin ids use underscores (`al_folio_core`).

### 3. This site's baseurl is empty

This repository publishes a **personal GitHub Pages site** at `https://nontrivialliu.github.io/`. `_config.yml` sets `url` to that origin and keeps `baseurl` empty. Local and CI builds therefore use the same root-relative paths:

```bash
bundle exec jekyll build
bundle exec jekyll serve            # http://localhost:4000/
```

The Docker entry point serves the same root path on port 8080. Keep internal links on Jekyll's `relative_url` filter and verify assets, canonical URLs, and language links against the built pages. The upstream demo's `/al-folio` prefix remains useful only for tests that explicitly override `baseurl` to compare with that demo.

## Wrapper to tag to gem delegation

`al_folio_core` is the hub: `_config.yml` sets `theme: al_folio_core`, and the gem ships every base `_layouts/*.liquid` and `_includes/*.liquid`, the base theme JS/CSS, the `details` and `file_exists` tags, and the `hideCustomBibtex` and `remove_accents` filters. Its `_includes/plugins/*.liquid` wrappers delegate to tags owned by sibling gems:

| Wrapper / call site       | Liquid tag                                                   | Owning gem                                                                     |
| ------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| search assets             | `al_search_assets`                                           | `al_search` (Cmd-K ninja-keys palette; index built at build time from content) |
| comments                  | `al_comments`                                                | `al_comments` (Giscus + Disqus, front-matter gated)                            |
| cookie banner             | `al_cookie_styles` / `al_cookie_scripts`                     | `al_cookie` (consent-mode gating of analytics)                                 |
| icon `<link>`s            | `al_icons_styles`                                            | `al_icons` (FontAwesome/Academicons/Scholar Icons from CDN)                    |
| analytics                 | `al_analytics_scripts`                                       | `al_analytics` (GA/Cronitor/Pirsch/OpenPanel)                                  |
| math                      | `al_math_styles` / `al_math_scripts`                         | `al_math` (MathJax, pseudocode.js, TikZJax)                                    |
| charts                    | `al_charts_scripts`                                          | `al_charts` (Mermaid/Chart.js/ECharts/Plotly/Vega/Leaflet/diff2html)           |
| image tools               | `al_img_tools_styles` / `al_img_tools_scripts`               | `al_img_tools` (zoom, lightbox, sliders, galleries)                            |
| newsletter                | `al_newsletter_form` / `al_newsletter_scripts`               | `al_newsletter` (Loops.so signup)                                              |
| `<html>` attributes       | `al_rtl_html_attrs` / `al_rtl_styles`                        | `al_rtl` (page `lang` in an RTL script; `al_rtl.langs` overrides the set)      |
| email addresses           | `al_email_protect_styles` / `al_email_protect_scripts`       | `al_email_protect` (site `protect_email: true`)                                |
| marimo notebooks          | `al_marimo_styles` / `al_marimo_scripts` / `al_marimo_embed` | `al_marimo` (page `marimo: true`)                                              |
| `layout: cv`              | `al_folio_cv_render`                                         | `al_folio_cv` (RenderCV YAML + JSONResume)                                     |
| `layout: distill`         | `al_folio_distill_render`                                    | `al_folio_distill` (vendored, hash-pinned distillpub runtime)                  |
| citation badges           | `google_scholar_citations` / `inspirehep_citations`          | `al_citations`                                                                 |
| external posts            | (generator, no tag)                                          | `al_ext_posts` (RSS/URL ingestion into synthetic posts)                        |
| legacy Bootstrap behavior | (opt-in assets)                                              | `al_folio_bootstrap_compat`                                                    |
| upgrade/audit CLI         | `bundle exec al-folio …`                                     | `al_folio_upgrade`                                                             |

## How feature gems ship their assets

Most feature gems are Jekyll `Generator`s that inject their JS/CSS as static files at build time, **only when the feature is enabled**. Consequences worth knowing:

- Those assets are not committed to this repo; you will not find them under `assets/` in a fresh checkout, and they appear in `_site/` only for enabled features.
- Several load from pinned CDN URLs with Subresource Integrity hashes read from the `third_party_libraries:` block in `_config.yml`. Bumping a library version means bumping its `integrity` hash in the same block.
- Do not vendor icon fonts or runtime JS back into starter paths to "fix" a missing asset — that is the silent-gating symptom in [failure mode 1](#1-features-fail-silently-when-the-gem-or-the-flag-is-missing), not a packaging bug.

## The v1 config contract

`_config.yml` must keep the `al_folio` contract keys:

- `al_folio.api_version: 1`
- `al_folio.style_engine: tailwind`
- `al_folio.tailwind.{version,css_entry,preflight}`
- `al_folio.distill.{engine,source}`

This is enforced **twice**: as build-time warnings by `al_folio_core`'s `:after_init` hook, and as **blocking** findings by `bundle exec al-folio upgrade audit` (which CI runs in `upgrade-check.yml`). Do not remove these keys.

## Local overrides

Site-specific overrides shadow gem-owned files at the same paths. The current repository uses this mechanism for bilingual interface labels and other site-specific adaptations; shared component fixes remain with their owning gems. Inspect each local diff against the installed gem before acknowledging it:

```bash
bundle exec al-folio upgrade overrides audit
bundle exec al-folio upgrade overrides diff <path>
bundle exec al-folio upgrade overrides accept <path>
```

`overrides accept` records the owning gem, version, and upstream/local SHA256 in `.al-folio-overrides.yml`; `overrides audit --fail-on-stale` checks that registration against the installed gems. `npm run lint:style-contract` accepts registered local files under component paths and checks the remaining starter boundary. Commit the reviewed override and its manifest entry together.

## Bootstrap compatibility is opt-in and time-boxed

`al_folio.compat.bootstrap.enabled: true` (default `false`) activates `al_folio_bootstrap_compat`, which restores legacy `data-toggle` and Bootstrap-class behavior on the Tailwind-first v1 core.

- Supported through `v1.2`
- Deprecated in `v1.3`
- Removed in `v2.0`

Migrate content off Bootstrap markup before then. See [FAQ](FAQ.md#how-do-i-handle-legacy-bootstrap-marked-pages-on-tailwind-first-v1x).

## Working on a gem alongside the starter

Plugin gems are developed as sibling checkouts next to this repo. Clone the gem repo beside your `al-folio` checkout, then point the `Gemfile` at your working copy and reinstall:

```ruby
gem "al_folio_core", path: "../al-folio-core"     # or git: / branch:
```

```bash
bundle install
bundle exec jekyll build
```

Revert the `Gemfile` to the pinned released version before committing — the pins in `Gemfile` are starter wiring and `test/style_contract.js` asserts some of them.
