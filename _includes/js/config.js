/*
This is the file in which you configure the data widgets. Feel free to experiment with the configuration options. 
But it is also completely okay to write and issue and ask for help to configure the widgets.
You probably want to check out the documentation at https://hp-theme.gbif-staging.org/documentation-intro
*/
var siteConfig = {
  "version": 3,
  "defaultChecklistKey": "7ddf754f-d193-4cc9-b351-99906754a03b", // Catalogue of Life
  "availableChecklistKeys": ["7ddf754f-d193-4cc9-b351-99906754a03b"], // the classification shown on occurrence pages
  "pages": [ // which pages do we want to enable
    {
      "id": "occurrenceSearch"
    },
    {
      "id": "occurrenceKey"
    },
    {
      "id": "collectionSearch"
    },
    {
      "id": "collectionKey"
    },
    {
      "id": "datasetSearch"
    },
    {
      "id": "datasetKey"
    },
    {
     "id": "institutionSearch"
    },
    {
      "id": "institutionKey"
    },
    {
      "id": "literatureSearch"
    }
  ],
  "disableInlineTableFilterButtons": false,
  "availableCatalogues": [
    // TODO: you should remove types you do not want to use
    "OCCURRENCE",
    "DATASET",
    // "COLLECTION",
    // "INSTITUTION",
    "LITERATURE"
  ],
  "dataHeader": {
    "enableApiPopup": false,
    "enableInfoPopup": false
  },
  "theme": {
    "primary": themeStyle.colors.primary,
    "borderRadius": themeStyle.square ? 0 : 3,
    "stickyOffset": "0px"
  },
  "maps": {
    "mapStyles": {
      "defaultProjection": "MERCATOR",
      "defaultMapStyle": "BRIGHT",
      "options": {
        "MERCATOR": [
          "BRIGHT",
          "NATURAL",
          "LUX_BASEMAP",
          "LUX_TOPO",
          "LUX_HYBRID",
          "LUX_ORTHO"
        ]
      }
    },
    // Additional map layers from Luxembourg's geoportail.lu (open data WMTS, CC0)
    // See https://data.public.lu/en/datasets/carte-de-base-webservices-wms-et-wmts/
    "styleLookup": {
      "MERCATOR": {
        "LUX_BASEMAP": "LUX_BASEMAP",
        "LUX_TOPO": "LUX_TOPO",
        "LUX_HYBRID": "LUX_HYBRID",
        "LUX_ORTHO": "LUX_ORTHO"
      }
    },
    "addMapStyles": function ({ mapStyleServer, language, pixelRatio, apiKeys, mapComponents }) {
      var mapComponent = mapComponents.MapLibreMap || mapComponents.OpenlayersMap;
      return {
        LUX_BASEMAP: {
          component: mapComponent,
          labelKey: 'mapLayernames.luxBasemap',
          mapConfig: {
            basemapStyle: '/assets/maps/geoportail-basemap.json',
            projection: 'EPSG_3857'
          }
        },
        LUX_TOPO: {
          component: mapComponent,
          labelKey: 'mapLayernames.luxTopomap',
          mapConfig: {
            basemapStyle: '/assets/maps/geoportail-topomap.json',
            projection: 'EPSG_3857'
          }
        },
        LUX_HYBRID: {
          component: mapComponent,
          labelKey: 'mapLayernames.luxHybrid',
          mapConfig: {
            basemapStyle: '/assets/maps/geoportail-hybrid.json',
            projection: 'EPSG_3857'
          }
        },
        LUX_ORTHO: {
          component: mapComponent,
          labelKey: 'mapLayernames.luxOrtho',
          mapConfig: {
            basemapStyle: '/assets/maps/geoportail-ortho.json',
            projection: 'EPSG_3857'
          }
        }
      }
    }
  },
  "languages": [
    {
      "code": "en",
      "localeCode": "en",
      "label": "English",
      "default": true,
      "textDirection": "ltr",
      "iso3LetterCode": "eng",
      "cmsLocale": "en-GB",
      "gbifOrgLocalePrefix": "",
      "mapTileLocale": "en"
    },
    {
      "code": "fr",
      "localeCode": "fr",
      "label": "Français",
      "default": false,
      "textDirection": "ltr",
      "iso3LetterCode": "fra",
      "cmsLocale": "fr",
      "gbifOrgLocalePrefix": "/fr",
      "mapTileLocale": "fr"
    }
  ],
  "messages": {
    "en": {
      "mapLayernames.luxBasemap": "Geoportail.lu basemap",
      "mapLayernames.luxTopomap": "Geoportail.lu topographic map",
      "mapLayernames.luxHybrid": "Geoportail.lu hybrid (ortho + labels)",
      "mapLayernames.luxOrtho": "Geoportail.lu orthophoto"
    },
    "fr": {
      "mapLayernames.luxBasemap": "Carte de base geoportail.lu",
      "mapLayernames.luxTopomap": "Carte topographique geoportail.lu",
      "mapLayernames.luxHybrid": "Carte hybride geoportail.lu",
      "mapLayernames.luxOrtho": "Orthophoto geoportail.lu"
    }
  },

  "occurrenceSearch": {
    "scope": {
      "type": "and",
      "predicates": [
        {
          "type": "in",
          "key": "publishingOrg",
          "values": [
            "75642970-f855-11dd-8235-b8a03c50a862",
            "28eb1a3f-1c15-4a95-931a-4af90ecb574d",
            "e2e717bf-551a-4917-bdc9-4fa0f342c530",
            "c8d737e0-2ff8-42e8-b8fc-6b805d26fc5f",
            "b872b075-9ab5-4e27-b6c6-5add6b890379",
            "a344ee9f-f1b7-4761-be2c-58ee6d741395",
            "bb646dff-a905-4403-a49b-6d378c2cf0d9",
          ]
        },
        {
          "type": "within",
          "geometry": "POLYGON((5.716188 49.902133, 5.733533 49.881967, 5.723771 49.861029, 5.718296 49.837566, 5.720893 49.813803, 5.731173 49.790997, 5.760220 49.778404, 5.783119 49.762936, 5.799551 49.741030, 5.807385 49.717372, 5.839458 49.707516, 5.843804 49.690579, 5.855613 49.668132, 5.872683 49.655062, 5.853155 49.635404, 5.840139 49.613387, 5.824462 49.592427, 5.829512 49.572332, 5.798033 49.560161, 5.783507 49.539501, 5.805774 49.520651, 5.825671 49.501151, 5.853128 49.484789, 5.889493 49.479110, 5.925618 49.480827, 5.946425 49.466049, 5.957103 49.443193, 5.988521 49.433598, 6.023256 49.432396, 6.058920 49.433465, 6.087705 49.436704, 6.121845 49.441229, 6.138830 49.460127, 6.165592 49.475139, 6.192391 49.489009, 6.229422 49.490520, 6.259120 49.482826, 6.284296 49.465271, 6.315411 49.453434, 6.348851 49.444598, 6.384300 49.444893, 6.399964 49.466137, 6.396404 49.489946, 6.391877 49.513929, 6.396955 49.535324, 6.409887 49.557620, 6.409634 49.580814, 6.429220 49.599048, 6.449700 49.618835, 6.462014 49.641788, 6.465991 49.664940, 6.492646 49.680695, 6.519092 49.696445, 6.541658 49.715117, 6.535478 49.737237, 6.545024 49.756929, 6.544363 49.780711, 6.558043 49.802375, 6.545753 49.824274, 6.510884 49.829971, 6.478736 49.839883, 6.444703 49.832390, 6.411464 49.840222, 6.388870 49.859619, 6.356297 49.868637, 6.332437 49.881448, 6.300026 49.892554, 6.270410 49.904859, 6.256895 49.926420, 6.251846 49.949729, 6.230284 49.967413, 6.205387 49.984227, 6.182218 50.001640, 6.173879 50.022341, 6.161557 50.044211, 6.155189 50.066448, 6.160357 50.089284, 6.163035 50.113206, 6.166040 50.137168, 6.151379 50.158433, 6.133878 50.179019, 6.099933 50.189043, 6.063458 50.186551, 6.046455 50.193109, 6.011846 50.197898, 5.975455 50.191041, 5.943229 50.179766, 5.933324 50.156389, 5.913186 50.137550, 5.883028 50.122901, 5.868117 50.101043, 5.847810 50.082462, 5.831098 50.061427, 5.829219 50.037546, 5.802773 50.020953, 5.799988 49.997107, 5.785637 49.981103, 5.755763 49.967515, 5.750485 49.943756, 5.732793 49.923293, 5.716188 49.902133))"
        }
      ]
    },
    "highlightedFilters": [
      // "taxonKey",
      "q",
      // "verbatimScientificName",
      "publishingOrg",
      "datasetKey",
      // "collectionKey",
      // "catalogNumber",
      // "recordedBy",
      // "identifiedBy",
      "datasetName",
      "administrativeArea"
    ],
    "excludedFilters": [
      "networkKey",
      "hostingOrganizationKey"
    ],
    "defaultEnabledTableColumns": [
      "features",
      "year",
      "eventDate",
      // "institutionKey",
      // "collectionKey",
      // "catalogNumber",
      // "country",
      "basisOfRecord",
      "samplingProtocol",
      "recordedBy",
      "identifiedBy",
      "publisher",
      "lastInterpreted"
    ],
    "tabs": [
      "table",
      "gallery",
      "map",
      // "clusters",
      "dashboard",
      "download"
    ],
    "mapSettings": {
      "lat": 49.8153,
      "lng": 6.1296,
      "zoom": 7.5
    }
  },
  "collectionSearch": {
    excludedFilters: ['country', 'active'],
    // highlightedFilters: ['q', 'type', 'publishingOrg', 'license'],
    // defaultTableColumns: ['title', 'description', 'publisher', 'type', 'occurrenceCount', 'literatureCount'],
    scope: {
      // TODO: you should add a scope here if you need search to be limited to a subset
      // search filters have the format {field: [values]}
      active: true
    },
  },
  "institutionSearch": {
    // excludedFilters: ['country', 'active'],
    // highlightedFilters: ['q', 'type'],
    // defaultTableColumns: ['title', 'type'],
    scope: {
      // TODO: you should add a scope here if you need search to be limited to a subset
      // search filters have the format {field: [values]}
      active: true
    }
  },
  "datasetSearch": {
    excludedFilters: ['publishingCountry', 'networkKey', 'projectId', 'hostingOrg'],
    highlightedFilters: ['q', 'type', 'publishingOrg', 'license'],
    scope: {
      // TODO: you should add a scope here if you need search to be limited to a subset
      // search filters have the format {field: [values]}
      type: ['CHECKLIST'], // 'OCCURRENCE', 
      publishingOrg: ['75642970-f855-11dd-8235-b8a03c50a862']
    },
  },
  "publisherSearch": {},
  "literatureSearch": {
    "scope": {
      // TODO: you should add a scope here if you need search to be limited to a subset
      // literature search use the predicate format similar to occurrence search
      "type": "in",
      "key": "countriesOfCoverage",
      "values": [
        "LU"
      ]
    }
  }
}
