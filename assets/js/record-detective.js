/* Record Detective — integrated into the Luxembourg hosted portal.
   Ported from https://mnhn-paul.github.io/inat-helpers/Tools/RecordDetective(minimal).html
   - all DOM access is scoped to the #record-detective container (element ids prefixed rd-)
   - no global variables leak into the portal page
   - static UI strings are bilingual (en/fr), picked from window.pageLang set by the theme
   - data scope is hard-wired to Luxembourg: iNaturalist place_id 120582, GBIF country LU
   Both api.inaturalist.org and api.gbif.org send Access-Control-Allow-Origin: *,
   so all calls run client-side from the portal domain without a proxy. */
(function () {
  'use strict';

  var root = document.getElementById('record-detective');
  if (!root) return;

  var INAT_PLACE_ID = 120582; // Grand-Duché de Luxembourg on iNaturalist
  var GBIF_COUNTRY = 'LU';

  var lang = (typeof window.pageLang === 'string' && window.pageLang === 'fr') ? 'fr' : 'en';
  var T = {
    en: {
      suggestionsError: 'Error loading suggestions.',
      loading: 'Loading data, please wait...',
      totalResults: function (n) { return 'Total results: ' + n; },
      fetchGbif: 'Fetch GBIF data',
      fetchingGbif: 'Fetching GBIF data...',
      gbifFetched: 'GBIF data fetched',
      keysPhase: 'Matching GBIF taxa...',
      keysProgress: function (done, total) { return 'Matching GBIF taxa (' + Math.min(done, total) + '/' + total + ')'; },
      occurrencesPhase: 'Querying GBIF occurrences...',
      occurrencesProgress: function (done, total) { return 'Querying GBIF occurrences (' + Math.min(done, total) + '/' + total + ')'; },
      updating: 'Updating table...',
      complete: 'Complete',
      rankMismatch: 'rank mismatch',
      noGbifMatchTitle: 'No matching GBIF taxon key found',
      viewGbifOccurrences: 'View occurrences in Luxembourg',
      viewOnGbif: 'View on GBIF'
    },
    fr: {
      suggestionsError: 'Erreur lors du chargement des suggestions.',
      loading: 'Chargement des données, veuillez patienter...',
      totalResults: function (n) { return 'Total des résultats : ' + n; },
      fetchGbif: 'Récupérer les données GBIF',
      fetchingGbif: 'Récupération des données GBIF...',
      gbifFetched: 'Données GBIF récupérées',
      keysPhase: 'Correspondance des taxons GBIF...',
      keysProgress: function (done, total) { return 'Correspondance des taxons GBIF (' + Math.min(done, total) + '/' + total + ')'; },
      occurrencesPhase: 'Interrogation des occurrences GBIF...',
      occurrencesProgress: function (done, total) { return 'Interrogation des occurrences GBIF (' + Math.min(done, total) + '/' + total + ')'; },
      updating: 'Mise à jour du tableau...',
      complete: 'Terminé',
      rankMismatch: 'écart de rang',
      noGbifMatchTitle: 'Aucune clé de taxon GBIF correspondante',
      viewGbifOccurrences: 'Voir les occurrences au Luxembourg',
      viewOnGbif: 'Voir sur GBIF'
    }
  }[lang];

  function $(id) { return root.querySelector('#' + id); }

  var taxonInput = $('rd-taxon-input');
  var suggestionsContainer = $('rd-suggestions');
  var selectedTaxonInfo = $('rd-selected-taxon');
  var selectedTaxonNameSpan = $('rd-selected-name');
  var selectedTaxonRankSpan = $('rd-selected-rank');
  var selectedTaxonIdSpan = $('rd-selected-id');
  var clearSelectionBtn = $('rd-clear-selection');
  var runQueryBtn = $('rd-run');
  var fetchGbifBtn = $('rd-fetch-gbif');
  var qualityFilterEl = $('rd-quality');
  var rankFilterEl = $('rd-rank');
  var startDateEl = $('rd-start-date');
  var gbifProgress = $('rd-gbif-progress');
  var gbifProgressBar = $('rd-gbif-progress-bar');
  var loadingStatus = $('rd-loading');
  var totalResultsEl = $('rd-total');
  var tableBody = $('rd-data-table');

  var currentSortColumn = 4;   // default sort: GBIF count, descending
  var sortAscending = false;
  var selectedTaxonId = null;
  var selectedTaxonName = null;
  var debounceTimeout = null;
  var gbifDataCache = new Map();
  var isFetchingGBIF = false;
  var taxonGbifKeyMap = new Map(); // iNat taxonId -> { usageKey, acceptedName, matchRank, iNatRank }
  var taxonRankMap = new Map();    // iNat taxonId -> rank

  function getTodayDate() {
    return new Date().toISOString().split('T')[0];
  }

  function delay(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  // --- URL state sync (shareable links) ---
  function syncToURL() {
    try {
      var params = new URLSearchParams();
      if (qualityFilterEl.value) params.set('quality', qualityFilterEl.value);
      if (rankFilterEl.value) params.set('rank', rankFilterEl.value);
      if (startDateEl.value) params.set('d1', startDateEl.value);
      if (selectedTaxonId) params.set('taxon_id', selectedTaxonId);
      if (selectedTaxonName) params.set('taxon_name', selectedTaxonName);
      history.replaceState(null, '', '?' + params.toString());
    } catch (e) { /* file:// or sandboxed contexts may block history API */ }
  }

  function loadFromURL() {
    var params = new URLSearchParams(window.location.search);
    var quality = params.get('quality');
    var rank = params.get('rank');
    var startDate = params.get('d1');
    var taxonId = params.get('taxon_id');
    var taxonName = params.get('taxon_name');
    if (quality && Array.prototype.some.call(qualityFilterEl.options, function (o) { return o.value === quality; })) {
      qualityFilterEl.value = quality;
    }
    if (rank && Array.prototype.some.call(rankFilterEl.options, function (o) { return o.value === rank; })) {
      rankFilterEl.value = rank;
    }
    if (startDate) startDateEl.value = startDate;
    if (taxonId && taxonName) {
      fetch('https://api.inaturalist.org/v1/taxa/' + encodeURIComponent(taxonId))
        .then(function (res) { return res.json(); })
        .then(function (data) {
          var r = (data.results && data.results[0]) ? (data.results[0].rank || '') : '';
          selectTaxon(parseInt(taxonId, 10), taxonName, r);
        })
        .catch(function () { selectTaxon(parseInt(taxonId, 10), taxonName, ''); });
    }
  }

  // --- taxon autocomplete ---
  function fetchSuggestions() {
    var input = taxonInput.value.trim();
    if (input.length < 3) {
      suggestionsContainer.innerHTML = '';
      return;
    }
    var query = encodeURIComponent(input);
    fetch('https://api.inaturalist.org/v1/taxa/autocomplete?q=' + query)
      .then(function (response) {
        if (!response.ok) throw new Error('Failed to fetch suggestions');
        return response.json();
      })
      .then(function (data) {
        suggestionsContainer.innerHTML = '';
        data.results.forEach(function (result) {
          var el = document.createElement('div');
          el.className = 'rd-suggestion';
          el.innerHTML = '<span><strong>' + result.name + '</strong> (' + result.rank + ')</span>' +
                         '<span class="rd-suggestion-id">ID: ' + result.id + '</span>';
          el.addEventListener('click', function () {
            selectTaxon(result.id, result.name, result.rank);
          });
          suggestionsContainer.appendChild(el);
        });
      })
      .catch(function () {
        suggestionsContainer.innerHTML = '<div>' + T.suggestionsError + '</div>';
      });
  }

  function selectTaxon(taxonId, taxonName, taxonRank) {
    selectedTaxonId = taxonId;
    selectedTaxonName = taxonName;
    selectedTaxonNameSpan.textContent = taxonName;
    selectedTaxonRankSpan.textContent = taxonRank;
    selectedTaxonIdSpan.textContent = taxonId;
    selectedTaxonInfo.hidden = false;
    suggestionsContainer.innerHTML = '';
    taxonInput.value = taxonName;
    fetchGbifBtn.disabled = false;
    syncToURL();
  }

  // --- sortable table ---
  function extractNumericValue(cell) {
    if (cell.textContent && !isNaN(parseFloat(cell.textContent))) {
      return parseFloat(cell.textContent);
    }
    var textOnly = cell.innerHTML.replace(/<[^>]*>/g, '');
    var m = textOnly.match(/([\d,]+)/);
    return m ? parseFloat(m[1].replace(/,/g, '')) : 0;
  }

  function sortTable(columnIndex) {
    var rows = Array.prototype.slice.call(tableBody.rows);
    rows.sort(function (a, b) {
      var numA = extractNumericValue(a.cells[columnIndex]);
      var numB = extractNumericValue(b.cells[columnIndex]);
      if (!isNaN(numA) && !isNaN(numB) && (numA !== 0 || numB !== 0)) {
        if (numA < numB) return sortAscending ? -1 : 1;
        if (numA > numB) return sortAscending ? 1 : -1;
      }
      var textA = a.cells[columnIndex].textContent.trim();
      var textB = b.cells[columnIndex].textContent.trim();
      if (textA < textB) return sortAscending ? -1 : 1;
      if (textA > textB) return sortAscending ? 1 : -1;
      return 0;
    });
    rows.forEach(function (row) { tableBody.appendChild(row); });
    root.querySelectorAll('th').forEach(function (th) { th.classList.remove('sorted-asc', 'sorted-desc'); });
    var header = root.querySelector('th[data-column="' + columnIndex + '"]');
    if (header) header.classList.add(sortAscending ? 'sorted-asc' : 'sorted-desc');
  }

  // --- iNaturalist analysis ---
  function runQuery() {
    var qualityFilter = qualityFilterEl.value;
    var taxonomicRank = rankFilterEl.value;
    var startDate = startDateEl.value;
    var endDate = getTodayDate();

    var apiUrl = 'https://api.inaturalist.org/v2/observations/species_counts?place_id=' + INAT_PLACE_ID +
      '&fields=taxon.id,taxon.name,taxon.rank,taxon.default_photo.square_url,count&' + qualityFilter +
      '&hrank=' + taxonomicRank;
    if (selectedTaxonId) apiUrl += '&taxon_id=' + selectedTaxonId;
    if (startDate) apiUrl += '&d1=' + startDate;
    apiUrl += '&d2=' + endDate;

    loadingStatus.hidden = false;
    loadingStatus.textContent = T.loading;
    totalResultsEl.textContent = '';
    tableBody.innerHTML = '';

    gbifDataCache.clear();
    taxonGbifKeyMap.clear();
    taxonRankMap.clear();
    fetchGbifBtn.disabled = true;
    fetchGbifBtn.textContent = T.fetchGbif;
    gbifProgress.hidden = true;
    isFetchingGBIF = false;

    fetchDataWithPagination(apiUrl, startDate, endDate, qualityFilter);
  }

  function fetchDataWithPagination(apiUrl, startDate, endDate, qualityFilter) {
    var allResults = [];
    var currentPage = 1;

    function loop() {
      var paginatedUrl = apiUrl + '&page=' + currentPage;
      return fetch(paginatedUrl)
        .then(function (response) {
          if (!response.ok) throw new Error('HTTP error ' + response.status);
          return response.json();
        })
        .then(function (data) {
          allResults = allResults.concat(data.results);
          if (data.results.length === 0 || allResults.length >= data.total_results) {
            return null;
          }
          currentPage++;
          return delay(1000).then(loop);
        })
        .catch(function (error) {
          console.error('Error during pagination:', error);
          return null;
        });
    }

    return loop().then(function () {
      if (allResults.length > 0) {
        totalResultsEl.textContent = T.totalResults(allResults.length);
        populateTable(allResults, startDate, endDate, qualityFilter);
      }
      loadingStatus.hidden = true;
      return fetchTotalObservationCounts(allResults, startDate, endDate, qualityFilter);
    }).then(function () {
      fetchGbifBtn.disabled = false;
      fetchGbifBtn.click(); // keep original behaviour: GBIF enrichment runs automatically
    });
  }

  function fetchTotalObservationCounts(data, startDate, endDate, qualityFilter) {
    var taxonIds = data.map(function (item) { return item.taxon.id; });
    var allResults = [];
    var batchSize = 50;
    var i = 0;

    function nextBatch() {
      if (i >= taxonIds.length) return Promise.resolve();
      var batch = taxonIds.slice(i, i + batchSize);
      i += batchSize;
      var apiUrl = 'https://api.inaturalist.org/v2/observations/species_counts?taxon_id=' + batch.join(',') +
        '&place_id=' + INAT_PLACE_ID + '&fields=taxon.id,taxon.name,count';
      return fetch(apiUrl)
        .then(function (response) { return response.json(); })
        .then(function (d) {
          allResults = allResults.concat(d.results);
          return delay(1000);
        })
        .catch(function (error) {
          console.error('Error fetching total counts:', error);
          return null;
        })
        .then(nextBatch);
    }

    return nextBatch().then(function () {
      var rows = tableBody.querySelectorAll('tr');
      rows.forEach(function (row) {
        var taxonLink = row.cells[0].querySelector('a');
        var taxonId = taxonLink ? taxonLink.href.split('/').pop() : null;
        if (!taxonId) return;
        var countCell = row.cells[1];
        var totalCell = row.cells[2];
        var ratioCell = row.cells[3];
        var total = allResults.find(function (item) { return item.taxon.id === parseInt(taxonId, 10); });
        if (!total) return;
        totalCell.textContent = total.count;
        var filteredCount = parseInt(countCell.textContent, 10);
        var totalCount = parseInt(total.count, 10);
        var ratio = totalCount > 0 ? (filteredCount / totalCount) : 0;
        ratioCell.textContent = ratio.toFixed(4);
        var observationUrl = 'https://inaturalist.lu/observations?taxon_id=' + taxonId + '&' + qualityFilter +
          '&d1=' + startDate + '&d2=' + endDate + '&place_id=' + INAT_PLACE_ID;
        countCell.innerHTML = '<a href="' + observationUrl + '" target="_blank" rel="noopener">' + filteredCount + '</a>';
      });
      sortTable(3); // sort by recency ratio once totals are filled
    });
  }

  function populateTable(data, startDate, endDate, qualityFilter) {
    tableBody.innerHTML = '';
    data.forEach(function (item) {
      var row = document.createElement('tr');
      var taxonName = item.taxon.name;
      var taxonId = item.taxon.id;
      var taxonRank = item.taxon.rank || '';
      var countSince = item.count;
      var photoUrl = item.taxon.default_photo ? item.taxon.default_photo.square_url : '';

      taxonRankMap.set(String(taxonId), taxonRank);

      row.innerHTML =
        '<td><a href="https://www.inaturalist.org/taxa/' + taxonId + '" target="_blank" rel="noopener" class="rd-italic">' + taxonName + '</a>' +
          (taxonRank ? ' <span class="rd-rank-tag">(' + taxonRank + ')</span>' : '') + '</td>' +
        '<td>' + countSince + '</td>' +
        '<td class="total"></td>' +
        '<td class="ratio"></td>' +
        '<td class="gbif-count rd-gbif-loading">...</td>' +
        '<td class="gbif-name rd-gbif-loading">...</td>' +
        '<td>' + (photoUrl ? '<img src="' + photoUrl + '" alt="' + taxonName + '" loading="lazy" onerror="this.style.display=\'none\'">' : '') + '</td>';
      tableBody.appendChild(row);
    });
    root.querySelectorAll('th').forEach(function (th) { th.classList.remove('sorted-asc', 'sorted-desc'); });
    var ratioHeader = root.querySelector('th[data-column="3"]');
    if (ratioHeader) ratioHeader.classList.add('sorted-desc');
  }

  // --- GBIF enrichment ---
  function updateGbifRowCells(row, data) {
    var countCell = row.cells[4];
    var nameCell = row.cells[5];
    countCell.classList.remove('rd-gbif-loading');
    nameCell.classList.remove('rd-gbif-loading');

    if (data.gbifKey && data.count > 0) {
      var occurrenceUrl = 'https://www.gbif.org/occurrence/search?taxon_key=' + data.gbifKey + '&country=' + GBIF_COUNTRY;
      countCell.innerHTML = '<a href="' + occurrenceUrl + '" target="_blank" rel="noopener" title="' + T.viewGbifOccurrences + '">' +
        data.count.toLocaleString() + '</a>';
    } else {
      countCell.textContent = '0';
    }

    if (data.gbifKey) {
      var speciesUrl = 'https://www.gbif.org/species/' + data.gbifKey;
      var displayName = data.acceptedName ? data.acceptedName : data.taxonName;
      var mismatchNote = '';
      if (data.iNatRank && data.matchRank && data.iNatRank.toLowerCase() !== data.matchRank.toLowerCase()) {
        mismatchNote = '<span class="rd-rank-mismatch" title="iNat rank: ' + data.iNatRank + ', GBIF rank: ' + data.matchRank + '">' +
          T.rankMismatch + '</span>';
      }
      nameCell.innerHTML = '<a href="' + speciesUrl + '" target="_blank" rel="noopener" title="' + T.viewOnGbif + '">' + displayName + '</a> ' + mismatchNote;
    } else {
      nameCell.innerHTML = '<span title="' + T.noGbifMatchTitle + '">' + data.taxonName + ' (no match)</span>';
    }
  }

  function getGbifTaxonInfo(scientificName, iNatRank) {
    var cleanName = scientificName.replace(/<\/?[^>]+(>|$)/g, '').trim();
    var matchUrl = 'https://api.gbif.org/v1/species/match?name=' + encodeURIComponent(cleanName) + '&verbose=true';
    return fetch(matchUrl)
      .then(function (response) {
        if (!response.ok) return null;
        return response.json();
      })
      .then(function (data) {
        function buildResult(match) {
          return {
            usageKey: match.acceptedUsageKey || match.usageKey,
            matchedNameKey: match.usageKey,
            acceptedName: match.accepted || match.scientificName || match.canonicalName,
            matchType: match.matchType,
            isSynonym: !!match.acceptedUsageKey,
            matchRank: match.rank || ''
          };
        }
        if (data.matchType && data.matchType !== 'NONE' && data.usageKey) {
          return buildResult(data);
        }
        if (data.alternatives && data.alternatives.length > 0) {
          var bestAlt = null;
          if (iNatRank) {
            bestAlt = data.alternatives.find(function (alt) {
              return alt.matchType !== 'NONE' && alt.usageKey && alt.rank && alt.rank.toLowerCase() === iNatRank.toLowerCase();
            });
          }
          if (!bestAlt) {
            bestAlt = data.alternatives.find(function (alt) { return alt.matchType !== 'NONE' && alt.usageKey; });
          }
          if (bestAlt) return buildResult(bestAlt);
        }
        return null;
      })
      .catch(function (error) {
        console.error('Error getting GBIF info for ' + scientificName + ':', error);
        return null;
      });
  }

  function fetchGBIFDataForAllRows() {
    if (isFetchingGBIF) return Promise.resolve();
    var rows = tableBody.querySelectorAll('tr');
    if (rows.length === 0) return Promise.resolve();

    isFetchingGBIF = true;
    fetchGbifBtn.disabled = true;
    fetchGbifBtn.textContent = T.fetchingGbif;
    gbifProgress.hidden = false;
    gbifProgressBar.style.width = '10%';
    gbifProgressBar.textContent = T.keysPhase;

    var taxonData = [];
    rows.forEach(function (row) {
      var taxonLink = row.cells[0].querySelector('a');
      var taxonId = taxonLink ? taxonLink.href.split('/').pop() : null;
      var taxonName = taxonLink ? taxonLink.textContent.trim() : '';
      taxonData.push({
        taxonId: taxonId,
        taxonName: taxonName,
        iNatRank: taxonRankMap.get(taxonId) || '',
        row: row
      });
    });

    var batchSize = 20;
    var i = 0;

    function matchBatch() {
      if (i >= taxonData.length) return Promise.resolve();
      var batch = taxonData.slice(i, i + batchSize);
      i += batchSize;
      return Promise.all(batch.map(function (item) {
        return getGbifTaxonInfo(item.taxonName, item.iNatRank).then(function (gbifInfo) {
          if (gbifInfo && gbifInfo.usageKey) {
            taxonGbifKeyMap.set(item.taxonId, Object.assign({}, gbifInfo, { iNatRank: item.iNatRank }));
          }
        });
      })).then(function () {
        var progress = Math.min(Math.round((i / taxonData.length) * 30) + 30, 60);
        gbifProgressBar.style.width = progress + '%';
        gbifProgressBar.textContent = T.keysProgress(i, taxonData.length);
        if (i < taxonData.length) return delay(500).then(matchBatch);
        return null;
      });
    }

    return matchBatch()
      .then(function () {
        gbifProgressBar.style.width = '60%';
        gbifProgressBar.textContent = T.occurrencesPhase;

        var gbifKeys = Array.from(taxonGbifKeyMap.values())
          .map(function (info) { return info.usageKey; })
          .filter(function (key) { return !!key; });

        if (gbifKeys.length === 0) {
          rows.forEach(function (row) {
            row.cells[4].classList.remove('rd-gbif-loading');
            row.cells[5].classList.remove('rd-gbif-loading');
            row.cells[4].textContent = '0';
            row.cells[5].innerHTML = '<span title="' + T.noGbifMatchTitle + '">No GBIF match</span>';
          });
          finishGbif();
          return null;
        }

        var occurrenceCounts = new Map();
        var keyBatchSize = 50;
        var k = 0;

        function countBatch() {
          if (k >= gbifKeys.length) return Promise.resolve();
          var keyBatch = gbifKeys.slice(k, k + keyBatchSize);
          k += keyBatchSize;
          var batchUrl = 'https://api.gbif.org/v1/occurrence/search?country=' + GBIF_COUNTRY +
            '&limit=0&facet=speciesKey&facetLimit=100000';
          keyBatch.forEach(function (key) { batchUrl += '&taxon_key=' + key; });
          return fetch(batchUrl)
            .then(function (response) { return response.json(); })
            .then(function (data) {
              if (data.facets && data.facets[0] && data.facets[0].counts) {
                data.facets[0].counts.forEach(function (facet) {
                  occurrenceCounts.set(parseInt(facet.name, 10), facet.count);
                });
              }
              var progress = Math.min(Math.round((k / gbifKeys.length) * 30) + 60, 90);
              gbifProgressBar.style.width = progress + '%';
              gbifProgressBar.textContent = T.occurrencesProgress(k, gbifKeys.length);
              if (k < gbifKeys.length) return delay(1000).then(countBatch);
              return null;
            })
            .catch(function (error) {
              console.error('Error fetching GBIF occurrences batch:', error);
              return countBatch();
            });
        }

        return countBatch().then(function () {
          gbifProgressBar.style.width = '90%';
          gbifProgressBar.textContent = T.updating;
          taxonData.forEach(function (item) {
            var gbifInfo = taxonGbifKeyMap.get(item.taxonId);
            var count = gbifInfo ? (occurrenceCounts.get(gbifInfo.usageKey) || 0) : 0;
            var result = {
              count: count,
              gbifKey: gbifInfo ? gbifInfo.usageKey : null,
              taxonId: item.taxonId,
              taxonName: item.taxonName,
              acceptedName: gbifInfo ? gbifInfo.acceptedName : null,
              iNatRank: item.iNatRank,
              matchRank: gbifInfo ? gbifInfo.matchRank : null
            };
            updateGbifRowCells(item.row, result);
            gbifDataCache.set(item.taxonId, result);
          });
          finishGbif();
        });
      });
  }

  function finishGbif() {
    fetchGbifBtn.textContent = T.gbifFetched;
    gbifProgressBar.style.width = '100%';
    gbifProgressBar.textContent = T.complete;
    isFetchingGBIF = false;
    setTimeout(function () { gbifProgress.hidden = true; }, 3000);
  }

  // --- wiring ---
  taxonInput.addEventListener('input', function () {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(fetchSuggestions, 300);
  });

  clearSelectionBtn.addEventListener('click', function () {
    selectedTaxonId = null;
    selectedTaxonName = null;
    selectedTaxonInfo.hidden = true;
    taxonInput.value = '';
    suggestionsContainer.innerHTML = '';
    fetchGbifBtn.disabled = true;
    syncToURL();
  });

  runQueryBtn.addEventListener('click', runQuery);
  fetchGbifBtn.addEventListener('click', function () {
    if (!isFetchingGBIF) fetchGBIFDataForAllRows();
  });

  qualityFilterEl.addEventListener('change', syncToURL);
  rankFilterEl.addEventListener('change', syncToURL);
  startDateEl.addEventListener('change', syncToURL);

  root.querySelectorAll('th.sortable').forEach(function (header) {
    header.addEventListener('click', function () {
      var columnIndex = parseInt(header.getAttribute('data-column'), 10);
      if (currentSortColumn === columnIndex) {
        sortAscending = !sortAscending;
      } else {
        currentSortColumn = columnIndex;
        sortAscending = true;
      }
      root.querySelectorAll('th').forEach(function (th) { th.classList.remove('sorted-asc', 'sorted-desc'); });
      header.classList.add(sortAscending ? 'sorted-asc' : 'sorted-desc');
      sortTable(columnIndex);
    });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFromURL);
  } else {
    loadFromURL();
  }
})();
