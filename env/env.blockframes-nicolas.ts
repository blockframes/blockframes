export const production = false;

// Firebase
// ========

export const appUrl = {
  content: 'https://blockframes-nicolas.web.app',
  market: 'https://festival-blockframes-nicolas.web.app',
  crm: 'https://crm-blockframes-nicolas.web.app',
  financiers: 'https://financiers-blockframes-nicolas.web.app',
};

const firebaseConfig = {
  apiKey: "AIzaSyC228JFWuVx4-XMPlxZbP5v7fyC8WRjD0E",
  authDomain: "blockframes-nicolas.firebaseapp.com",
  databaseURL: 'https://blockframes-nicolas.firebaseio.com',
  projectId: "blockframes-nicolas",
  storageBucket: "blockframes-nicolas.appspot.com",
  messagingSenderId: "595561197746",
  appId: "1:595561197746:web:155ea27417feaeafa419ab",
  measurementId: "G-L0ELW3HRWZ"
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
    festival: 'nicolas_festival_org',
    financiers: 'nicolas_financiers_org',
    catalog: 'nicolas_catalog_org'
  },
  indexNameMovies: {
    festival: 'nicolas_festival_movies',
    financiers: 'nicolas_financiers_movies',
    catalog: 'nicolas_catalog_movies',
  },
  indexNameUsers: 'nicolas_users',
};

// Emails
// =======

export const supportEmails = {
  default: 'ngermain@cascade8.com',
  catalog: 'ngermain+catalog@cascade8.com',
  festival: 'ngermain+festival@cascade8.com',
  financiers: 'ngermain+financiers@cascade8.com',
}

export const mailchimp = {
  server: 'us20',
  listId: 'efaccd1d28'
};

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
  festival: 0,
  financiers: 0,
  catalog: 0
}

// Intercom
// ========

export const intercomId = '';

// Sentry
// =======

export const sentryEnv = undefined;
export const sentryDsn = undefined;

// BigQuery
// ========

export const bigQueryAnalyticsTable = 'blockframes-nicolas.analytics_301960050.events_';

// Archipel OrgIds
// ========

export const centralOrgId = {
  cascade8: 'jnbHKBP5YLvRQGcyQ8In',
  catalog: 'nBM8sy5EEAOtVBCX4nTJ',
};

// Import / Export parameters
// =======

export const backupBucket = 'nicolas-backups';
export const heavyChunkSize = 7;
export const chunkSize = 15;

// JwPlayer
// @see https://dashboard.jwplayer.com/p/M0ZSpeUV/media/YlSFNnkR
// ========

export const jwplayer = {
  propertyId: 'M0ZSpeUV',
  playerId: 'LVeBD5vf',
  testVideoId: 'YlSFNnkR'
}
