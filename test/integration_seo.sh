#!/usr/bin/env bash
set -euo pipefail

site_dir="$(mktemp -d /tmp/nontrivial-seo.XXXXXX)"
build_log="$(mktemp /tmp/nontrivial-seo-build.XXXXXX.log)"
trap 'rm -rf "$site_dir"; rm -f "$build_log"' EXIT

if ! JEKYLL_ENV=production bundle exec jekyll build \
  --config _config.yml,test/polyglot_config.yml \
  --destination "$site_dir" >"$build_log" 2>&1; then
  tail -100 "$build_log" >&2
  exit 1
fi

ruby -rjson -rrexml/document -ruri -e '
  root = ARGV.fetch(0)
  origin = "https://nontrivialliu.github.io"
  read = ->(path) { File.read(File.join(root, path)) }
  check = ->(condition, message) { abort message unless condition }

  sitemap = REXML::Document.new(read.call("sitemap.xml"))
  urls = sitemap.root.elements.to_a.map { |entry| entry.elements[1].text }
  check.call(urls.uniq == urls, "Sitemap contains duplicate URLs")
  check.call(urls.all? { |url| url.start_with?(origin + "/") }, "Sitemap contains another host")

  expected = %w[/ /zh-cn/ /blog/ /zh-cn/blog/ /publications/ /zh-cn/publications/ /repositories/ /zh-cn/repositories/ /zh-cn/blog/gnn-intro-translation/]
  expected.each { |path| check.call(urls.include?(origin + path), "Sitemap is missing #{path}") }
  urls.each do |url|
    path = URI(url).path
    output = path.end_with?("/") ? File.join(root, path, "index.html") : File.join(root, path)
    check.call(File.file?(output), "Sitemap URL has no generated page: #{url}")
    check.call(!File.read(output).include?(%(<meta name="robots" content="noindex">)), "Sitemap includes noindex page: #{url}")
  end

  home = read.call("index.html")
  zh_home = read.call("zh-cn/index.html")
  check.call(home.include?("Henan University") && zh_home.include?("河南大学"), "Education is missing from a homepage")
  coverage = "https://news.eeworld.com.cn/mp/STM32/a294635.jspx"
  check.call(home.include?(coverage) && zh_home.include?(coverage), "STM32 coverage is missing from a homepage")
  check.call(home.include?("NonTrivialLiu") && zh_home.include?("NonTrivialLiu"), "Identity is missing from a homepage")
  check.call(!home.include?("you@example.com") && !home.include?("qc6CJjYAAAAJ"), "Template identity appears on the homepage")
  check.call(home.include?(%q{<meta property="og:url" content="https://nontrivialliu.github.io/">}), "English social URL is incorrect")
  check.call(zh_home.include?(%q{<meta property="og:url" content="https://nontrivialliu.github.io/zh-cn/">}), "Chinese social URL is incorrect")
  check.call(home.include?(%q{<meta property="og:locale" content="en_US">}) && zh_home.include?(%q{<meta property="og:locale" content="zh_CN">}), "Social locale is incorrect")
  check.call(home.include?(%q{<meta property="og:image" content="https://nontrivialliu.github.io/assets/img/prof_pic.jpg">}), "Homepage preview image is incorrect")

  person = home.scan(%r{<script type="application/ld\+json">\s*(\{.*?\})\s*</script>}m).map { |json| JSON.parse(json.first) }.find { |data| data["@type"] == "Person" }
  check.call(person && person["@id"] == origin + "/#person", "Person identity is missing")
  check.call(person["alternateName"].include?("刘非凡") && person["alternateName"].include?("NonTrivialLiu"), "Person aliases are incomplete")
  %w[https://github.com/NonTrivialLiu https://orcid.org/0009-0004-7514-3994 https://sciprofiles.com/profile/feifan-liu].each do |url|
    check.call(person["sameAs"].include?(url), "Person profile is missing: #{url}")
  end

  publications = read.call("publications/index.html")
  check.call(publications.include?(%q{id="liu2025edge"}), "Own publication is missing")
  check.call(!publications.include?("Einstein"), "Template publication appears in the publication list")

  demo = read.call("blog/2015/formatting-and-links/index.html")
  check.call(demo.include?(%q{<meta name="robots" content="noindex">}), "Template article is indexable")
  check.call(!urls.include?(origin + "/blog/2015/formatting-and-links/"), "Template article appears in sitemap")

  fallback = read.call("blog/gnn-intro-translation/index.html")
  translation = read.call("zh-cn/blog/gnn-intro-translation/index.html")
  canonical = %q{<link rel="canonical" href="https://nontrivialliu.github.io/zh-cn/blog/gnn-intro-translation/">}
  check.call(fallback.include?(canonical) && translation.include?(canonical), "Translation canonical is inconsistent")
  check.call(fallback.include?(%q{<meta name="robots" content="noindex">}), "Fallback translation is indexable")
  check.call(!translation.include?(%q{hreflang="en"}), "Translation advertises an English version")
  check.call(translation.include?(%q{<meta property="og:image" content="https://nontrivialliu.github.io/assets/img/gnn-intro-thumbnail.jpg">}), "Translation preview image is incorrect")

  check.call(read.call("robots.txt").include?(origin + "/sitemap.xml"), "Robots file omits sitemap")
  puts "SEO integration checks passed (#{urls.length} canonical URLs)."
' "$site_dir"
