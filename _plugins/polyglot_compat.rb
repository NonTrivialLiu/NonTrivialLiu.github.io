# frozen_string_literal: true

module PolyglotCompat
  module_function

  def localized_build?(site)
    site.respond_to?(:active_lang) && site.respond_to?(:default_lang) && site.active_lang != site.default_lang
  end

  def asset?(item)
    paths = []
    paths << item.url.to_s if item.respond_to?(:url)
    paths << item.relative_path.to_s if item.respond_to?(:relative_path)
    paths.any? { |path| path.match?(%r{(?:\A|/)assets/}) }
  end

  def canonical_url(site, item)
    language_permalinks = item.data["permalink_lang"] || {}
    permalink = language_permalinks[site.default_lang] || item.data["permalink"] || item.url
    permalink = "/#{permalink}" unless permalink.start_with?("/")

    "#{site.config.fetch("url").delete_suffix("/")}#{site.config.fetch("baseurl", "").delete_suffix("/")}#{permalink}"
  end

  def correct_fallback_canonical(site, item)
    return if item.output.nil? || item.data["rendered_lang"] == site.active_lang

    canonical = %(<link rel="canonical" href="#{canonical_url(site, item)}">)
    item.output.sub!(%r{<link rel="canonical" href="[^"]+"\s*/?>}, canonical)
  end
end

# Polyglot 1.14 restores these fields only after a successful localized pass.
# Keep the Site reusable when a generator raises midway through that pass.
module PolyglotStateGuard
  def process_active_language
    previous_dest = @dest
    previous_exclude = @exclude.dup
    super
  ensure
    @dest = previous_dest
    @exclude = previous_exclude
  end
end

Jekyll::Site.prepend(PolyglotStateGuard) unless Jekyll::Site.ancestors.include?(PolyglotStateGuard)

# jekyll-imagemagick writes directly to site.dest, bypassing Polyglot's static
# file exclusions. Run it only for the default-language build so every locale
# shares the responsive images emitted at the site root.
Jekyll::Hooks.register :site, :post_read do |site|
  next unless site.respond_to?(:active_lang) && site.respond_to?(:default_lang)

  imagemagick = site.config["imagemagick"]
  imagemagick["enabled"] = site.active_lang == site.default_lang if imagemagick.is_a?(Hash)
end

# Plugin-owned generators publish assets after Polyglot has filtered the source
# tree. Drop those duplicate write entries from localized builds; their URLs
# already point to the shared root assets. Also restore the configured fallback
# canonical, which Polyglot's final URL-relativization pass otherwise prefixes.
Jekyll::Hooks.register :site, :post_render do |site|
  next unless PolyglotCompat.localized_build?(site)

  site.static_files.reject! { |item| PolyglotCompat.asset?(item) }
  site.pages.reject! { |item| PolyglotCompat.asset?(item) }
  site.collections.each_value do |collection|
    collection.docs.each { |item| PolyglotCompat.correct_fallback_canonical(site, item) }
  end
  site.pages.each { |item| PolyglotCompat.correct_fallback_canonical(site, item) }
end
