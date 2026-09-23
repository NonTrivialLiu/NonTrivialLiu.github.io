#!/usr/bin/env bash
set -euo pipefail

site_dir="$(mktemp -d /tmp/al-folio-polyglot.XXXXXX)"
build_log="$(mktemp /tmp/al-folio-polyglot-build.XXXXXX.log)"
trap 'rm -rf "$site_dir"; rm -f "$build_log"' EXIT

if ! bundle exec jekyll build --config _config.yml,test/polyglot_config.yml --destination "$site_dir" >"$build_log" 2>&1; then
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

assert_not_contains() {
  local file="$1"
  local unexpected="$2"
  if grep -Fq "$unexpected" "$file"; then
    printf 'Expected %s not to contain: %s\n' "$file" "$unexpected" >&2
    exit 1
  fi
}

test -f "$site_dir/index.html"
test -f "$site_dir/zh-cn/index.html"
test -f "$site_dir/blog/2021/distill/index.html"
test -f "$site_dir/zh-cn/blog/2021/distill/index.html"
test -f "$site_dir/blog/2022/rtl/index.html"
if test -d "$site_dir/zh-cn/assets" && find "$site_dir/zh-cn/assets" -type f -print -quit | grep -q .; then
  printf 'Expected localized assets directory to contain no duplicated files.\n' >&2
  exit 1
fi

assert_contains "$site_dir/index.html" '<html lang="en"'
assert_contains "$site_dir/zh-cn/index.html" '<html lang="zh-cn"'
assert_contains "$site_dir/blog/2021/distill/index.html" '<html lang="en"'
assert_contains "$site_dir/zh-cn/blog/2021/distill/index.html" '<html lang="en"'
assert_contains "$site_dir/blog/2022/rtl/index.html" '<html lang="fa" dir="rtl"'

# Paired pages advertise each other: the English home links the translation,
# and the translated home links back to English.
assert_contains "$site_dir/index.html" '<link rel="canonical" href="https://alshedivat.github.io/al-folio/">'
assert_contains "$site_dir/zh-cn/index.html" '<link rel="canonical" href="https://alshedivat.github.io/al-folio/zh-cn/">'
assert_contains "$site_dir/index.html" 'hreflang="zh-cn"'
assert_contains "$site_dir/zh-cn/index.html" 'href="/al-folio/zh-cn/"'
assert_contains "$site_dir/zh-cn/index.html" 'href="/al-folio/"'

# A page that only exists in English keeps the switcher disabled, canonicalizes
# to the default language, and publishes no translation alternate.
assert_contains "$site_dir/plugins/index.html" 'class="nav-link disabled" lang="zh-cn" aria-disabled="true"'
assert_contains "$site_dir/plugins/index.html" '<link rel="canonical" href="https://alshedivat.github.io/al-folio/plugins/">'
assert_not_contains "$site_dir/plugins/index.html" 'hreflang="zh-cn"'

printf 'Polyglot integration checks passed.\n'
