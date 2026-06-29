/*
This is the file in which you configure the data widgets. Feel free to experiment with the configuration options. 
But it is also completely okay to write and issue and ask for help to configure the widgets.
You probably want to check out the documentation at https://hp-theme.gbif-staging.org/documentation-intro
*/
var siteConfig = {
  "version": 3,
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
    "COLLECTION",
    // "INSTITUTION",
    "LITERATURE"
  ],
  "dataHeader": {
    "enableApiPopup": false,
    "enableInfoPopup": false
  },
  "theme": {
    "primary": themeStyle.colors.primary,
    "borderRadius": 3,
    "stickyOffset": "0px"
  },
  "maps": {
    "mapStyles": {
      "defaultProjection": "MERCATOR",
      "defaultMapStyle": "BRIGHT",
      "options": {
        "MERCATOR": [
          "BRIGHT",
          "NATURAL"
        ]
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
      "code": "da",
      "localeCode": "da",
      "label": "Dansk",
      "default": false,
      "textDirection": "ltr",
      "iso3LetterCode": "dan",
      "cmsLocale": "en-GB",
      "gbifOrgLocalePrefix": "",
      "mapTileLocale": "en"
    }
  ],
  "messages": {},
  "occurrenceSearch": {
    "scope": {
      "type": "and",
      "predicates": [
        {
          "type": "or",
          "predicates": [
            {
              "type": "equals",
              "key": "publishingOrg",
              "values": [
                "75642970-f855-11dd-8235-b8a03c50a862",
                "e2e717bf-551a-4917-bdc9-4fa0f342c530",
                "c8d737e0-2ff8-42e8-b8fc-6b805d26fc5f"
              ]  
            },
            {
              "type": "in",
              "key": "datasetKey",
              "values": [
                "a621b3ba-8415-41f2-a4af-7ec9511ae868"
              ]
            }
          ]
        },
        {
          "type": "not",
          "predicate": {
            "type": "in",
            "key": "datasetKey",
            "values": [
              "2814930a-3b93-48d6-b887-00979481ac9e"
            ]
          }
        },
        {
          "type": "within",
          "geometry": "POLYGON((6.18869 50.17408, 6.07922 50.19745, 5.98539 50.20412, 5.86029 50.12398, 5.78209 50.02528, 5.70912 49.91129, 5.74039 49.78187, 5.85507 49.66561, 5.80295 49.59301, 5.77688 49.50847, 5.96715 49.42377, 6.11571 49.42377, 6.23039 49.48477, 6.40242 49.43903, 6.55359 49.68922, 6.56662 49.80879, 6.25646 49.95491, 6.18869 50.17408))"
        }
      ]
    }
  },
    "highlightedFilters": [
      // "taxonKey",
      "q",
      // "verbatimScientificName",
      "publishingOrg",
      // "collectionKey",
      // "catalogNumber",
      "recordedBy",
      "identifiedBy",
      "dataset",
      "administrativeArea"
    ],
    "excludedFilters": [
      "networkKey",
      "hostingOrganizationKey"
    ],
    "defaultEnabledTableColumns": [
      "features",
      "eventDate",
      // "institutionKey",
      // "collectionKey",
      // "catalogNumber",
      // "country",
      "year",
      "samplingProtocol",
      "recordedBy",
      "identifiedBy",
      "datasetName",
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
      type: ['OCCURRENCE', 'CHECKLIST']
    },
  },
  "publisherSearch": {},
  "literatureSearch": {
    "scope": {
      // TODO: you should add a scope here if you need search to be limited to a subset
      // literature search use the predicate format similar to occurrence search
      "type": "in",
      "key": "publishingOrganizationKey",
      "values": [
        "760d5f24-4c04-40da-9646-1b2c935da502",
        "2e7df380-8356-4533-bcb3-5459e23c794e",
        "8e1a97a0-3ca8-11d9-8439-b8a03c50a862"
      ]
    }
  }
}
