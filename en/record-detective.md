---
lang-ref: record-detective
layout: compose
title: Record Detective
description: Compare iNaturalist observation trends for Luxembourg taxa with their GBIF occurrence records
background: /assets/images/ZPIN.jpg
imageLicense: None for this image
height: 40vh
permalink: /tools/record-detective/
head: |
  <link rel="stylesheet" href="/assets/css/record-detective.css">
composition:
  - type: heroImage
  - type: pageMarkdown
---

Record Detective cross-checks how actively a taxon is observed on **iNaturalist in Luxembourg** against the occurrence records published for it on **GBIF**. Pick a taxon, run the analysis, and the tool lists the taxa observed in Luxembourg below it, how recent those observations are (recency ratio), and how many GBIF occurrence records exist for each. All queries run live in your browser against the iNaturalist and GBIF APIs — no data is stored on this portal.

<div id="record-detective">
  <div class="rd-section">
    <h2>1. Select a taxon</h2>
    <p class="rd-note">Start typing a taxon name of any rank (kingdom to species) and select the appropriate entry from the list before proceeding.</p>
    <input type="text" id="rd-taxon-input" placeholder="Enter taxon name (minimum 3 characters)" autocomplete="off" />
    <div id="rd-suggestions"></div>
    <div id="rd-selected-taxon" class="rd-selected" hidden>
      <h3>Selected taxon: <span id="rd-selected-name"></span></h3>
      <p><strong>Rank:</strong> <span id="rd-selected-rank"></span> &middot; <strong>Taxon ID:</strong> <span id="rd-selected-id"></span></p>
      <button id="rd-clear-selection" class="rd-btn rd-btn-clear" type="button">Clear selection</button>
    </div>
  </div>

  <div class="rd-section">
    <h2>2. Configure the analysis</h2>
    <p class="rd-note">
      a) For <em>identification completeness</em>, choose "Verifiable" for all observations with sufficient metadata that were identified at least once (default; recommended), or "Research grade" for those validated by the iNaturalist community.<br />
      b) For <em>taxonomic rank</em>, choose whether you are also (not exclusively) interested in observations only identified to genus level (default).<br />
      c) For <em>start date</em>, choose a date to evaluate the ratio of observations made since that date relative to all observations. A ratio of 1 means the first record of this taxon on iNaturalist was made since that date (if unsure, try 01-01-2020).
    </p>
    <div class="rd-filter-grid">
      <div class="rd-filter">
        <label for="rd-quality">Identification completeness:</label>
        <select id="rd-quality">
          <option value="verifiable=true">Verifiable</option>
          <option value="quality_grade=research">Research grade</option>
        </select>
      </div>
      <div class="rd-filter">
        <label for="rd-rank">Taxonomic rank:</label>
        <select id="rd-rank">
          <option value="genus">Genus</option>
          <option value="species">Species</option>
        </select>
      </div>
      <div class="rd-filter">
        <label for="rd-start-date">Start date:</label>
        <input type="date" id="rd-start-date" />
      </div>
    </div>
    <div class="rd-button-group">
      <button id="rd-run" class="rd-btn rd-btn-primary" type="button">Run analysis</button>
      <button id="rd-fetch-gbif" class="rd-btn rd-btn-secondary" type="button" disabled>Fetch GBIF data</button>
    </div>
    <div class="rd-progress" id="rd-gbif-progress" hidden>
      <div class="rd-progress-bar" id="rd-gbif-progress-bar">0%</div>
    </div>
    <p id="rd-loading" class="rd-loading" hidden>Loading data, please wait...</p>
    <p id="rd-total" class="rd-total"></p>
    <div class="rd-table-wrap">
      <table id="rd-table">
        <thead>
          <tr>
            <th class="sortable" data-column="0">Taxon name (iNat)</th>
            <th class="sortable" data-column="1"># obs. since start date (iNat)</th>
            <th class="sortable" data-column="2"># obs. total (iNat)</th>
            <th class="sortable" data-column="3">Recency ratio (iNat)</th>
            <th class="sortable" data-column="4"># obs. total (GBIF)</th>
            <th>Taxon name (GBIF)</th>
            <th>Photo</th>
          </tr>
        </thead>
        <tbody id="rd-data-table"></tbody>
      </table>
    </div>
  </div>
</div>

<script src="/assets/js/record-detective.js" defer></script>
