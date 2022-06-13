export const production = false;

// Firebase
// ========

export const appUrl = {
  content: 'https://blockframes-remco.web.app',
  market: 'http://blockframes-remco-festival.web.app',
  crm: 'https://blockframes-remco-crm.web.app',
  financiers: 'https://blockframes-remco-financiers.web.app'
};

const firebaseConfig = {
  apiKey: 'AIzaSyB1cJKPNsBDnq3qaK1VOUm2bNHuIJYthBY',
  authDomain: 'blockframes-remco.firebaseapp.com',
  databaseURL: 'https://blockframes-remco.firebaseio.com',
  projectId: 'blockframes-remco',
  storageBucket: 'blockframes-remco.appspot.com',
  messagingSenderId: '734521736086',
  appId: '1:734521736086:web:42cff622b99ae91a687bb7',
  measurementId: 'G-S2WM53H3YX'
};

export const firebaseRegion = 'europe-west1';

export function firebase(app?: string) {
  return firebaseConfig
}

// Algolia
// =======

export const algolia = {
  appId: '8E9YO1I9HB',
  searchKey: '4a2990a293c0ee0bfde9ebd66270a47f',
  indexNameOrganizations: {
    festival: 'remco_festival_orgs',
    financiers: 'remco_financiers_orgs',
    catalog: 'remco_catalog_orgs'
  },
  indexNameMovies: {
    festival: 'remco_festival_movies',
    financiers: 'remco_financiers_movies',
    catalog: 'remco_catalog_movies'
  },
  indexNameUsers: 'remco_users',
};

// Support emails
// =======

export const supportEmails = {
  default: 'rsimonides@cascade8.com',
  catalog: 'rsimonides+catalog@cascade8.com',
  festival: 'rsimonides+festival@cascade8.com',
  financiers: 'rsimonides+financiers@cascade8.com'
}

// Yandex
// =======

export const yandex = {
  festival: 0,
  financiers: 0,
  catalog: 0
};

// Hotjar
// ========
export const hotjar = {
  festival: 2887118,
  financiers: 0,
  catalog: 0
}

// Intercom
// ========

export const intercomId = 'srwfltp4';

// Sentry
// =======

export const sentryEnv = undefined;
export const sentryDsn = undefined;

// BigQuery
// ========
export const bigQueryAnalyticsTable = 'blockframes-remco.analytics_234801912.events_';

// Data Studio
// ========

export const datastudio = {
  user: '1564ae35-5e86-4632-bfef-ef7f4db7a865/page/P9czB',
  users: '978dc4a0-6dfc-4499-b159-f69f53aeb3a5/page/00YOC',
  events: 'a98badcf-df61-4f32-903d-6e703c75fd3d/page/TK5PC'
}

// Archipel OrgIds
// ========

export const centralOrgId = {
  cascade8: 'jnbHKBP5YLvRQGcyQ8In',
  catalog: 'nBM8sy5EEAOtVBCX4nTJ',
};

// Import / Export parameters
// =======

export const backupBucket = 'backup-bucket-remco';
export const heavyChunkSize = 5
export const chunkSize = 25

// JwPlayer
// @see https://dashboard.jwplayer.com/#/content/detail?key=7R9ttesP&property=75507f12-83b6-11ea-ab11-3e60acbe08db&spotlight=default&tab=metadata&view=list
// ========

export const playerId = 'LVeBD5vf';
export const testVideoId = 'YlSFNnkR';
