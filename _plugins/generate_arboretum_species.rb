# frozen_string_literal: true

# Generates one "species passport" page per row of _data/arboretum_species.tsv,
# in every locale of the site (portal convention: the root language is served
# without a URL prefix, other languages under /<lang>/).
#
# The normalized rows are also exposed as site.data["arboretum_species"] so the
# arboretum-species/index.html landing pages can loop over them.

require "csv"
require "json"

module Jekyll
  # A Jekyll::Page without a backing file on disk.
  class ArboretumSpeciesPage < Jekyll::Page
    def initialize(site, row, locale, prefix, jsonld, description)
      @site = site
      @base = site.source
      @dir = ""
      @name = "index.html"
      self.data = {
        "layout"         => "arboretum_species_passport",
        "lang"           => locale,
        "lang-ref"       => "arboretum-species-#{row['slug']}",
        "title"          => "#{row['scientific_name']} — #{row['common_name_en'] || row['scientific_name']}",
        "description"    => description,
        "permalink"      => "#{prefix}/arboretum-species/#{row['slug']}/",
        "species"        => row,
        "species_jsonld" => jsonld,
      }
      self.content = ""
      process(@name)
    end
  end

  class ArboretumSpeciesGenerator < Generator
    TSV_PATH = File.join("_data", "arboretum_species.tsv")
    REQUIRED_COLUMNS = %w[slug COL_taxon_id scientific_name].freeze
    SLUG_PATTERN = /\A[a-z0-9]+(?:-[a-z0-9]+)*\z/.freeze

    def generate(site)
      path = File.join(site.source, TSV_PATH)
      unless File.exist?(path)
        Jekyll.logger.warn "ArboretumSpecies:", "no #{TSV_PATH} found — no passport pages generated"
        return
      end

      rows = parse_tsv(path)
      site.data["arboretum_species"] = rows
      return if rows.empty?

      # Use the portal's own _data/languages.yml (site.data["languages"] would
      # also include locales contributed by the remote theme).
      root_lang = (site.config["algae"] && site.config["algae"]["rootLang"] || "en").to_s
      locales = site_languages(site) || [root_lang]

      rows.each do |row|
        locales.each do |locale|
          prefix = locale == root_lang ? "" : "/#{locale}"
          description = row["description_#{locale}"] || row["description_en"] || row["scientific_name"]
          site.pages << ArboretumSpeciesPage.new(site, row, locale, prefix, build_jsonld(row, locale), description)
        end
      end

      Jekyll.logger.info "ArboretumSpecies:",
        "generated #{rows.size * locales.size} passport page(s) " \
        "(#{rows.size} species x #{locales.size} locale(s): #{locales.join(', ')})"
    end

    private

    def site_languages(site)
      path = File.join(site.source, "_data", "languages.yml")
      return nil unless File.exist?(path)
      require "yaml"
      data = YAML.safe_load(File.read(path, encoding: "utf-8"), permitted_classes: [Symbol])
      return nil unless data.is_a?(Hash)
      keys = data.keys.map(&:to_s)
      keys.empty? ? nil : keys
    end

    def parse_tsv(path)
      rows = []
      seen_slugs = {}
      content = File.read(path, encoding: "utf-8")
      table = CSV.parse(content, col_sep: "\t", headers: true, quote_char: nil,
                               header_converters: ->(h) { h.to_s.strip })
      missing = REQUIRED_COLUMNS - table.headers
      unless missing.empty?
        Jekyll.logger.warn "ArboretumSpecies:", "#{TSV_PATH} is missing column(s): #{missing.join(', ')}"
      end

      table.each_with_index do |csv_row, i|
        row_number = i + 2 # line 1 is the header
        row = {}
        csv_row.headers.each do |header|
          value = csv_row[header]
          value = value.strip if value.is_a?(String)
          row[header] = (value.nil? || value == "") ? nil : value
        end

        slug = row["slug"]
        if slug.nil? || slug !~ SLUG_PATTERN
          Jekyll.logger.warn "ArboretumSpecies:",
            "row #{row_number}: skipped — empty or invalid slug #{slug.inspect} (must match #{SLUG_PATTERN})"
          next
        end
        if seen_slugs.key?(slug)
          Jekyll.logger.warn "ArboretumSpecies:",
            "row #{row_number}: skipped — duplicate slug #{slug.inspect} (first used on row #{seen_slugs[slug]})"
          next
        end
        if row["COL_taxon_id"].nil? || row["COL_taxon_id"] !~ /\A[A-Za-z0-9]+\z/
          Jekyll.logger.warn "ArboretumSpecies:",
            "row #{row_number} (#{slug}): skipped — COL_taxon_id must be a GBIF/COL taxon key (alphanumeric), got #{row['COL_taxon_id'].inspect}"
          next
        end
        if row["scientific_name"].nil?
          Jekyll.logger.warn "ArboretumSpecies:", "row #{row_number} (#{slug}): skipped — scientific_name is empty"
          next
        end

        seen_slugs[slug] = row_number
        rows << row
      end
      rows
    rescue CSV::MalformedCSVError => e
      Jekyll.logger.warn "ArboretumSpecies:", "could not parse #{TSV_PATH}: #{e.message}"
      []
    end

    def build_jsonld(row, locale)
      common_names = %w[en fr lb de].map do |l|
        row["common_name_#{l}"]
      end.compact
      hash = {
        "@context"    => "https://schema.org",
        "@type"       => "Taxon",
        "name"        => row["scientific_name"],
        "author"      => row["scientific_name_authorship"],
        "taxonRank"   => "species",
        "identifier"  => row["COL_taxon_id"],
        "url"         => "https://www.gbif.org/taxon/#{row['COL_taxon_id']}",
        "sameAs"      => "https://www.gbif.org/taxon/#{row['COL_taxon_id']}",
        "alternateName" => common_names,
      }
      key = locale == "fr" ? "description_fr" : "description_en"
      hash["description"] = row[key] || row["description_en"] if row[key] || row["description_en"]
      %(<script type="application/ld+json">\n#{JSON.generate(hash)}\n</script>)
    end
  end
end
