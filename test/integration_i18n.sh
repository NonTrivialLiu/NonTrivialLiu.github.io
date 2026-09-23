#!/usr/bin/env bash
set -euo pipefail

# Checks the translation layer: dictionary parity (strict), the labels that
# reach a rendered Simplified Chinese page, and the missing-key diagnostics.

site_dir="$(mktemp -d /tmp/al-folio-i18n.XXXXXX)"
build_log="$(mktemp /tmp/al-folio-i18n-build.XXXXXX.log)"
fixture_dir="$(mktemp -d /tmp/al-folio-i18n-validator.XXXXXX)"
recovery_dir="$(mktemp -d /tmp/al-folio-i18n-recovery.XXXXXX)"
trap 'rm -rf "$site_dir" "$fixture_dir" "$recovery_dir"; rm -f "$build_log"' EXIT

# The build itself is the parity check: AL_FOLIO_I18N_STRICT=1 turns missing,
# extra, or empty dictionary entries into a failed build.
if ! AL_FOLIO_I18N_STRICT=1 bundle exec jekyll build --config _config.yml,test/polyglot_config.yml --destination "$site_dir" >"$build_log" 2>&1; then
  tail -100 "$build_log" >&2
  exit 1
fi

assert_contains() {
  local file="$1"
  local expected="$2"
  if ! grep -Fq "$expected" "$file"; then
    printf 'Expected %s to contain: %s\n' "$file" "$expected" >&2
    exit 1
  fi
}

assert_absent() {
  local file="$1"
  local unexpected="$2"
  if grep -Fq "$unexpected" "$file"; then
    printf 'Expected %s not to contain: %s\n' "$file" "$unexpected" >&2
    exit 1
  fi
}

assert_matches() {
  local file="$1"
  local pattern="$2"
  if ! grep -Eq "$pattern" "$file"; then
    printf 'Expected %s to match: %s\n' "$file" "$pattern" >&2
    exit 1
  fi
}

home="$site_dir/zh-cn/index.html"
publications="$site_dir/zh-cn/publications/index.html"
teaching="$site_dir/zh-cn/teaching/index.html"
course="$site_dir/zh-cn/teachings/data-science-fundamentals/index.html"
projects="$site_dir/zh-cn/projects/index.html"
project="$site_dir/zh-cn/projects/1_project/index.html"
repositories="$site_dir/zh-cn/repositories/index.html"
people="$site_dir/zh-cn/people/index.html"
cv="$site_dir/zh-cn/cv/index.html"
books="$site_dir/zh-cn/books/index.html"
blog="$site_dir/zh-cn/blog/index.html"
post="$site_dir/zh-cn/blog/2024/post-citation/index.html"
archive="$site_dir/zh-cn/blog/2023/index.html"
not_found="$site_dir/zh-cn/404.html"
book="$site_dir/zh-cn/books/the_godfather/index.html"
dropdown="$site_dir/zh-cn/dropdown/index.html"
distill="$site_dir/zh-cn/blog/2021/distill/index.html"

# Translated interface labels reach the rendered page.
assert_contains "$home" '>动态</a>'
assert_contains "$home" '>最新文章</a>'
assert_contains "$home" '>代表论文</a>'
assert_contains "$home" '版权所有 2026'
# kramdown rewrites the straight quotes of that attribute into typographic
# ones, so match the label itself.
assert_contains "$publications" '输入关键词筛选'
assert_contains "$teaching" '近期日程'
assert_contains "$teaching" '显示日历'
assert_contains "$course" '<strong>教师：</strong>'
assert_contains "$course" '<th>周次</th>'
assert_contains "$course" '<th>资料</th>'
assert_contains "$projects" '>工作</h2>'
assert_contains "$project" '参考文献'
assert_contains "$repositories" 'GitHub 仓库'
assert_contains "$people" '合作者'
assert_contains "$cv" '联系方式'
assert_contains "$cv" '教育经历'
assert_contains "$books" '已读完'
assert_contains "$blog" '分钟阅读'
assert_contains "$post" '创建于'
assert_contains "$post" '如果本文对你有帮助'
assert_contains "$archive" '归档'
assert_contains "$not_found" '页面不存在'
assert_contains "$not_found" '/al-folio/zh-cn/'
assert_contains "$book" '封面：'
assert_contains "$book" '<link rel="canonical" href="https://alshedivat.github.io/al-folio/books/the_godfather/">'
assert_absent "$book" 'hreflang="zh-cn"'
assert_contains "$dropdown" '更多'
assert_contains "$distill" '>目录</h3>'
test ! -e "$site_dir/zh-cn/_pages/dropdown/index.html"
assert_contains "$home" 'data-copy-code-aria="复制代码到剪贴板"'
assert_contains "$site_dir/assets/js/copy_code.js" 'document.documentElement.dataset.copyCodeAria'

# Dates print in Chinese on translated pages and stay untouched in English.
assert_matches "$blog" '[0-9]+ 年 [0-9]+ 月 [0-9]+ 日'
assert_matches "$site_dir/blog/index.html" '[A-Z][a-z]+ [0-9]+, [0-9]{4}'

# The English source labels are gone from those pages.
for label in ">news</a>" "latest posts" "selected publications" "Type to filter" \
  "Upcoming Events" "Show Calendar" "No news so far" "No posts so far" \
  ">Contact Information<" ">Professional Summary<" \
  "No courses available yet" "Created on" "an archive of" "Cover of" "Start Date:" \
  "or as a BibTeX entry"; do
  for file in "$home" "$publications" "$teaching" "$course" "$projects" "$project" \
    "$repositories" "$cv" "$blog" "$post" "$archive" "$not_found" "$book"; do
    assert_absent "$file" "$label"
  done
done

# The validator reports a translation gap as a failure, not a silent fallback.
mkdir -p "$fixture_dir/_data/en" "$fixture_dir/_data/zh-cn"
cp _data/en/i18n.yml "$fixture_dir/_data/en/i18n.yml"
ruby -ryaml -e '
  dictionary = YAML.safe_load(File.read("_data/zh-cn/i18n.yml"), aliases: true)
  dictionary["home"].delete("news")
  File.write(ARGV[0], dictionary.to_yaml)
' "$fixture_dir/_data/zh-cn/i18n.yml"

validator=$(cat <<'RUBY'
require "jekyll"
require_relative "_plugins/al_i18n"

site = Struct.new(:source, :config, :active_lang).new(ARGV[0], { "lang" => "en", "default_lang" => "en", "languages" => ["en", "zh-cn"] }, "zh-cn")

begin
  AlI18n.validate!(site)
rescue Jekyll::Errors::FatalException
  exit 0
end

warn "validator accepted a dictionary with a missing key"
exit 1
RUBY
)

if ! AL_FOLIO_I18N_STRICT=1 bundle exec ruby -e "$validator" "$fixture_dir"; then
  printf 'Expected the i18n validator to reject an incomplete translation dictionary.\n' >&2
  exit 1
fi

# A present but structurally invalid value must fail during validation rather
# than surfacing later as a missing label while a template renders.
ruby -ryaml -e '
  dictionary = YAML.safe_load(File.read("_data/zh-cn/i18n.yml"), aliases: true)
  dictionary["home"]["news"] = ["动态"]
  File.write(ARGV[0], dictionary.to_yaml)
' "$fixture_dir/_data/zh-cn/i18n.yml"

if ! AL_FOLIO_I18N_STRICT=1 bundle exec ruby -e "$validator" "$fixture_dir"; then
  printf 'Expected the i18n validator to reject a non-string translation.\n' >&2
  exit 1
fi

missing_key_validator=$(cat <<'RUBY'
require "jekyll"
require_relative "_plugins/al_i18n"

site = Struct.new(:source, :config, :active_lang).new(
  Dir.pwd,
  { "lang" => "en", "default_lang" => "en", "languages" => ["en", "zh-cn"] },
  "zh-cn"
)

begin
  AlI18n.translate(site, "template.key.that.does.not.exist")
rescue Jekyll::Errors::FatalException
  exit 0
end

warn "strict mode accepted an unknown template key"
exit 1
RUBY
)

if ! AL_FOLIO_I18N_STRICT=1 bundle exec ruby -e "$missing_key_validator"; then
  printf 'Expected strict mode to reject an unknown template key.\n' >&2
  exit 1
fi

# Whitespace control in the post template must not join the date and author.
author_meta=$(bundle exec ruby -e '
  require "jekyll"
  require_relative "_plugins/al_i18n"

  site_class = Struct.new(:source, :config, :active_lang)
  template = Liquid::Template.parse(%q{April 28, 2024{% if author -%}{{- "post.by" | t -}}{{- author -}}{%- endif %}})
  site = site_class.new(Dir.pwd, { "lang" => "en", "default_lang" => "en", "languages" => ["en", "zh-cn"] }, "en")
  print template.render({ "author" => "Albert Einstein" }, registers: { site: site })
')

if test "$author_meta" != 'April 28, 2024 by Albert Einstein'; then
  printf 'Post metadata joined the publication date and author: %s\n' "$author_meta" >&2
  exit 1
fi

# Interrupt a localized pass, assert all mutable Site state was restored, then
# rebuild and confirm the translated output survives without nested paths.
recovery=$(cat <<'RUBY'
require "jekyll"
require_relative "_plugins/al_i18n"
require_relative "_plugins/polyglot_compat"

destination = ARGV[0]
config = Jekyll.configuration(
  "source" => Dir.pwd,
  "destination" => destination,
  "external_sources" => [],
  "quiet" => true
)
site = Jekyll::Site.new(config)

expected_dest = nil
expected_exclude = nil
Jekyll::Hooks.register :site, :post_write do |current|
  next unless current.respond_to?(:active_lang) && current.active_lang == current.default_lang && expected_dest.nil?

  expected_dest = current.dest
  expected_exclude = current.instance_variable_get(:@exclude).dup
end

abort_once = true
Jekyll::Hooks.register :site, :post_read do |current|
  next unless current.respond_to?(:active_lang) && current.active_lang == "zh-cn" && abort_once

  abort_once = false
  raise "simulated feed timeout"
end

begin
  site.process
rescue StandardError
  # the interrupted build is the point of the check
end
state_restored = expected_dest && site.dest == expected_dest && site.instance_variable_get(:@exclude) == expected_exclude
site.process

zh_home = File.join(destination, "zh-cn", "index.html")
translated = File.file?(zh_home) && File.read(zh_home).include?("在这里写下你的个人简介")
nested = File.directory?(File.join(destination, "zh-cn", "zh-cn"))

unless state_restored
  current_exclude = site.instance_variable_get(:@exclude)
  abort "Polyglot state was not restored after an interrupted pass " \
        "(dest=#{site.dest.inspect}, expected_dest=#{expected_dest.inspect}, " \
        "extra_excludes=#{current_exclude - Array(expected_exclude)}, " \
        "missing_excludes=#{Array(expected_exclude) - current_exclude})"
end
abort "the rebuild after an interrupted pass wrote English into /zh-cn/ (nested=#{nested})" unless translated && !nested
RUBY
)

if ! bundle exec ruby -e "$recovery" "$recovery_dir"; then
  printf 'Expected a rebuild after an interrupted pass to keep serving the translation.\n' >&2
  exit 1
fi

printf 'i18n integration checks passed.\n'
