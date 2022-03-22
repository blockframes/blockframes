export const production = true;

// Firebase
// ========

export const appUrl = {
  content: 'https://archipelcontent.com',
  market: 'https://archipelmarket.com',
  financiers: 'https://mediafinanciers.com',
  crm: 'https://crm.blockframes.io',
};

const firebaseConfig = {
  apiKey: 'AIzaSyCcUEsNlBgusJtyYAawoJAshnnHBruM1ss',
  authDomain: 'blockframes.firebaseapp.com',
  databaseURL: 'https://blockframes.firebaseio.com',
  projectId: 'blockframes',
  storageBucket: 'blockframes.appspot.com',
  messagingSenderId: '1080507348015'
};

const appConfigs = {
  festival: {
    appId: "1:1080507348015:web:6fee072c90f5a9510002da",
    measurementId: "G-QC4D0W5506"
  },
  catalog: {
    appId: "1:1080507348015:web:1009793cb9e2b297",
    measurementId: "G-Q4BWTRSV6P"
  },
  financiers: {
    appId: "1:1080507348015:web:e5bdd85e161de4220002da",
    measurementId: "G-RZF25ZLQ2M"
  },
  cms: {
    appId: "1:1080507348015:web:9abd62a79dc41e710002da",
    measurementId: "G-THGSYK1D7K"
  },
  crm: {
    appId: "1:1080507348015:web:ede10e0ebf25604e0002da",
    measurementId: "G-X8XFZQCL8Z"
  },
  default: {
    appId: "1:1080507348015:web:413468c3253b02760002da",
    measurementId: "G-NHLYYB4DSP"
  }
}

export const firebaseRegion = 'europe-west1';

// Enable or disable emulators parts
// and run "npm run firebase:emulator"
// @see https://www.notion.so/cascade8/Emulator-79492738d2614b35b6435eb80584ff26
export const emulators = {
  auth: false,
  firestore: false,
  functions: false
};

export function firebase(app?: keyof typeof appConfigs) {
  return app ? {
    ...firebaseConfig,
    ...appConfigs[app]
  } : {
      ...firebaseConfig,
      ...appConfigs.default
    }
}



// Algolia
// =======

export const algolia = {
  appId: '8E9YO1I9HB',
  searchKey: '4a2990a293c0ee0bfde9ebd66270a47f',
  indexNameOrganizations: {
    festival: 'prod_festival_org',
    financiers: 'prod_financiers_org',
    catalog: 'prod_catalog_org'
  },
  indexNameMovies: {
    festival: 'prod_festival_movies',
    financiers: 'prod_financiers_movies',
    catalog: 'prod_catalog_movies',
  },
  indexNameUsers: 'prod_users',
};

// Support emails
// =======

export const supportEmails = {
  default: 'team@cascade8.com',
  catalog: 'support@archipelcontent.com',
  festival: 'support@archipelmarket.com',
  financiers: 'support@mediafinanciers.com'
}

// Yandex
// =======

export const yandex = {
  festival: 65689861,
  financiers: 70097020,
  catalog: 56105038
};

// Intercom
// ========

export const intercomId = 'srwfltp4';

// OMDB
// =======

export const omdbApiKey = '4d1be897';

// Sentry
// =======

export const sentryEnv = 'production';
export const sentryDsn = 'https://a5f8a3139c754fa088453dbd710d9418@sentry.io/1540126';

// BigQuery
// ========

export const bigQueryAnalyticsTable = 'blockframes.analytics_193045559.events_';

// Data Studio
// ========

export const datastudio = {
  user: 'fd0ee9b3-0306-4404-ae96-a67d708e2c58/page/dLd2B',
  users: '978dc4a0-6dfc-4499-b159-f69f53aeb3a5/page/00YOC',
  events: 'b7d36865-858d-45a0-b667-80e8cc6d0140/page/TK5PC'
}

// Archipel OrgIds
// ========

export const centralOrgId = {
  cascade8: 'jnbHKBP5YLvRQGcyQ8In',
  catalog: 'nBM8sy5EEAOtVBCX4nTJ',
};

// Import / Export parameters
// =======

export const backupBucket = 'blockframes-backups';
export const heavyChunkSize = 7;
export const chunkSize = 15;

// JwPlayer
// @see https://dashboard.jwplayer.com/#/content/detail?key=7R9ttesP&property=75507f12-83b6-11ea-ab11-3e60acbe08db&spotlight=default&tab=metadata&view=list
// ========

export const playerId = 'lpkRdflk';
export const testVideoId = 'YlSFNnkR';
