---
lang-ref: record-detective
layout: compose
title: Record Detective
description: Comparer les tendances d'observation iNaturalist pour les taxons du Luxembourg avec leurs données d'occurrences GBIF
background: /assets/images/ZPIN.jpg
imageLicense: None for this image
height: 40vh
permalink: /fr/tools/record-detective/
head: |
  <link rel="stylesheet" href="/assets/css/record-detective.css">
composition:
  - type: heroImage
  - type: pageMarkdown
---

Record Detective croise l'activité d'observation d'un taxon sur **iNaturalist au Luxembourg** avec les occurrences publiées pour ce taxon sur **GBIF**. Choisissez un taxon, lancez l'analyse : l'outil liste les taxons observés au Luxembourg sous ce taxon, la récence de ces observations (ratio de récence) et le nombre de données d'occurrences GBIF pour chacun. Toutes les requêtes sont exécutées en direct dans votre navigateur via les API d'iNaturalist et de GBIF — aucune donnée n'est stockée sur ce portail.

<div id="record-detective">
  <div class="rd-section">
    <h2>1. Sélectionner un taxon</h2>
    <p class="rd-note">Commencez à taper le nom d'un taxon, quel que soit son rang (règne à espèce), puis sélectionnez l'entrée appropriée dans la liste.</p>
    <input type="text" id="rd-taxon-input" placeholder="Entrez un nom de taxon (3 caractères minimum)" autocomplete="off" />
    <div id="rd-suggestions"></div>
    <div id="rd-selected-taxon" class="rd-selected" hidden>
      <h3>Taxon sélectionné : <span id="rd-selected-name"></span></h3>
      <p><strong>Rang :</strong> <span id="rd-selected-rank"></span> &middot; <strong>ID du taxon :</strong> <span id="rd-selected-id"></span></p>
      <button id="rd-clear-selection" class="rd-btn rd-btn-clear" type="button">Effacer la sélection</button>
    </div>
  </div>

  <div class="rd-section">
    <h2>2. Configurer l'analyse</h2>
    <p class="rd-note">
      a) Pour la <em>complétude d'identification</em>, choisissez « Verifiable » pour toutes les observations disposant de métadonnées suffisantes et identifiées au moins une fois (par défaut ; recommandé), ou « Research grade » pour celles validées par la communauté iNaturalist.<br />
      b) Pour le <em>rang taxonomique</em>, choisissez si vous vous intéressez aussi (sans exclusive) aux observations identifiées uniquement au niveau du genre (par défaut).<br />
      c) Pour la <em>date de début</em>, choisissez une date afin d'évaluer le ratio des observations faites depuis cette date par rapport à l'ensemble des observations. Un ratio de 1 signifie donc que le premier signalement de ce taxon sur iNaturalist date d'après cette date (en cas de doute, essayez le 01-01-2020).
    </p>
    <div class="rd-filter-grid">
      <div class="rd-filter">
        <label for="rd-quality">Complétude d'identification :</label>
        <select id="rd-quality">
          <option value="verifiable=true">Verifiable</option>
          <option value="quality_grade=research">Research grade</option>
        </select>
      </div>
      <div class="rd-filter">
        <label for="rd-rank">Rang taxonomique :</label>
        <select id="rd-rank">
          <option value="genus">Genre</option>
          <option value="species">Espèce</option>
        </select>
      </div>
      <div class="rd-filter">
        <label for="rd-start-date">Date de début :</label>
        <input type="date" id="rd-start-date" />
      </div>
    </div>
    <div class="rd-button-group">
      <button id="rd-run" class="rd-btn rd-btn-primary" type="button">Lancer l'analyse</button>
      <button id="rd-fetch-gbif" class="rd-btn rd-btn-secondary" type="button" disabled>Récupérer les données GBIF</button>
    </div>
    <div class="rd-progress" id="rd-gbif-progress" hidden>
      <div class="rd-progress-bar" id="rd-gbif-progress-bar">0%</div>
    </div>
    <p id="rd-loading" class="rd-loading" hidden>Chargement des données, veuillez patienter...</p>
    <p id="rd-total" class="rd-total"></p>
    <div class="rd-table-wrap">
      <table id="rd-table">
        <thead>
          <tr>
            <th class="sortable" data-column="0">Nom du taxon (iNat)</th>
            <th class="sortable" data-column="1"># obs. depuis la date de début (iNat)</th>
            <th class="sortable" data-column="2"># obs. total (iNat)</th>
            <th class="sortable" data-column="3">Ratio de récence (iNat)</th>
            <th class="sortable" data-column="4"># obs. total (GBIF)</th>
            <th>Nom du taxon (GBIF)</th>
            <th>Photo</th>
          </tr>
        </thead>
        <tbody id="rd-data-table"></tbody>
      </table>
    </div>
  </div>
</div>

<script src="/assets/js/record-detective.js" defer></script>
