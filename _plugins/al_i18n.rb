# frozen_string_literal: true

require "yaml"
require "date"

# Site-local translation layer.
#
# Templates ask for a semantic key instead of hard-coding a language:
#
#   {{ "home.news" | t }}
#
# English labels live in `_data/en/i18n.yml`, translations in
# `_data/<lang>/i18n.yml`. Resolution order is the active language, then
# English, then the key itself, so a missing translation degrades to the
# source language instead of blanking the page. `validate!` compares the
# dictionaries on every build and reports drift in the build log; set
# `AL_FOLIO_I18N_STRICT=1` to turn those reports into a failed build.
#
# A language dictionary may also carry a `config:` section, which overrides the
# matching value in `_config.yml` for that language only (`description`,
# `footer_text`, ...). English keeps reading `_config.yml`, so default-language
# output is unchanged.
module AlI18n
  DATA_DIR = "_data"
  DICTIONARY_FILE = "i18n.yml"
  DEFAULT_LANG = "en"
  # Site config values a language dictionary may override through `config:`.
  CONFIG_KEYS = %w[description contact_note footer_text blog_name blog_description].freeze
  STRICT_ENV = "AL_FOLIO_I18N_STRICT"

  class << self
    def reset_cache!
      @dictionaries = {}
      @reported = {}
    end

    def strict?
      %w[1 true yes on].include?(ENV[STRICT_ENV].to_s.strip.downcase)
    end

    def language(site)
      active = site.respond_to?(:active_lang) ? site.active_lang : nil
      (active || site.config["lang"] || DEFAULT_LANG).to_s
    end

    def default_language(site)
      (site.config["default_lang"] || DEFAULT_LANG).to_s
    end

    def languages(site)
      configured = site.config["languages"]
      configured = [DEFAULT_LANG] unless configured.is_a?(Array) && !configured.empty?
      ([default_language(site)] + configured.map(&:to_s)).uniq
    end

    def dictionary(site, lang)
      cache_key = [File.expand_path(site.source), lang]
      (@dictionaries ||= {})[cache_key] ||= load_dictionary(site, lang)
    end

    def load_dictionary(site, lang)
      path = File.join(site.source, DATA_DIR, lang, DICTIONARY_FILE)
      return {} unless File.file?(path)

      dictionary = YAML.safe_load(File.read(path), permitted_classes: [Date, Time], aliases: true) || {}
      return dictionary if dictionary.is_a?(Hash)

      raise Jekyll::Errors::FatalException, "#{path}: dictionary root must be a mapping"
    rescue Psych::SyntaxError => e
      raise Jekyll::Errors::FatalException, "#{path}: #{e.message}"
    end

    def resolve(dictionary, key)
      key.to_s.split(".").reduce(dictionary) do |node, part|
        node.is_a?(Hash) ? node[part] : nil
      end
    end

    # Leaves of a dictionary, as dotted paths. `config:` is handled separately,
    # because it mirrors `_config.yml` rather than the UI string set.
    def leaf_keys(node, prefix = nil, keys = [])
      return keys unless node.is_a?(Hash)

      node.each do |key, value|
        path = prefix ? "#{prefix}.#{key}" : key.to_s
        value.is_a?(Hash) ? leaf_keys(value, path, keys) : keys << path
      end
      keys
    end

    def labels(dictionary)
      dictionary.reject { |key, _value| key.to_s == "config" }
    end

    # `placeholder` is the last resort for data-driven labels (project
    # categories, book statuses) whose key set is not known ahead of time: it
    # keeps the raw value on the page instead of the dotted key path.
    def translate(site, key, placeholder = nil)
      lang = language(site)
      value = resolve(dictionary(site, lang), key)
      return value if value.is_a?(String) && !value.strip.empty?

      source = resolve(dictionary(site, default_language(site)), key)
      return source if source.is_a?(String) && !source.strip.empty?

      report_missing(site, lang, key) if placeholder.nil?
      placeholder.nil? ? key.to_s : placeholder.to_s
    end

    def report_missing(site, lang, key)
      signature = "#{lang}:#{key}"
      return if (@reported ||= {})[signature]

      @reported[signature] = true
      message = "'#{key}' has no #{lang} translation"
      raise Jekyll::Errors::FatalException, message if strict?

      Jekyll.logger.warn "i18n:", message
    end

    def validate!(site)
      default_lang = default_language(site)
      default_dictionary = dictionary(site, default_lang)
      baseline = labels(default_dictionary)
      baseline_keys = leaf_keys(baseline)
      failures = invalid_values(default_lang, baseline)
      failures.concat(config_failures(default_lang, default_dictionary["config"]))

      languages(site).each do |lang|
        next if lang == default_lang

        current_dictionary = dictionary(site, lang)
        current = labels(current_dictionary)
        current_keys = leaf_keys(current)
        (baseline_keys - current_keys).each { |key| failures << "#{lang}: missing '#{key}'" }
        (current_keys - baseline_keys).each { |key| failures << "#{lang}: '#{key}' is not in #{default_lang}" }
        failures.concat(invalid_values(lang, current))
        failures.concat(config_failures(lang, current_dictionary["config"]))
      end

      return if failures.empty?

      failures.sort.each { |failure| Jekyll.logger.warn "i18n:", failure }
      return unless strict?

      raise Jekyll::Errors::FatalException, "i18n dictionaries disagree:\n- #{failures.sort.join("\n- ")}"
    end

    def invalid_values(lang, dictionary)
      leaf_keys(dictionary).filter_map do |key|
        value = resolve(dictionary, key)
        "#{lang}: '#{key}' must be a non-empty string" unless value.is_a?(String) && !value.strip.empty?
      end
    end

    def config_failures(lang, config)
      return [] if config.nil?
      return ["#{lang}: config overrides must be a mapping"] unless config.is_a?(Hash)

      config.filter_map do |key, value|
        key = key.to_s
        if !CONFIG_KEYS.include?(key)
          "#{lang}: config override '#{key}' is not supported (see AlI18n::CONFIG_KEYS)"
        elsif !value.is_a?(String) || value.strip.empty?
          "#{lang}: config override '#{key}' must be a non-empty string"
        end
      end
    end

    # Remembers the values shipped in `_config.yml` so overriding them for one
    # language cannot leak into the next language of the same build.
    def capture_config!(site)
      @pristine_config = CONFIG_KEYS.to_h { |key| [key, site.config[key]] }
    end

    def apply_config_overrides(site)
      overrides = dictionary(site, language(site))["config"]
      overrides = {} unless overrides.is_a?(Hash)
      pristine = @pristine_config || {}

      CONFIG_KEYS.each do |key|
        value = overrides[key]
        site.config[key] = value.is_a?(String) && !value.strip.empty? ? value : pristine[key]
      end
    end
  end
end

module AlI18nFilters
  # `{{ "home.news" | t }}` -> "news" in English, "动态" in Simplified Chinese.
  # The optional argument is the placeholder for keys whose set is open ended,
  # for example `{{ 'categories.' | append: category | t: category }}`.
  def t(key, placeholder = nil)
    AlI18n.translate(@context.registers[:site], key, placeholder)
  end
end

Liquid::Template.register_filter(AlI18nFilters)

Jekyll::Hooks.register :site, :after_init do |site|
  AlI18n.reset_cache!
  AlI18n.capture_config!(site)
end

# Jekyll resets the site between `--watch` rebuilds; drop the parsed
# dictionaries so edited YAML is picked up again.
Jekyll::Hooks.register :site, :after_reset do |_site|
  AlI18n.reset_cache!
end

Jekyll::Hooks.register :site, :post_read do |site|
  AlI18n.validate!(site)
  AlI18n.apply_config_overrides(site)
end
