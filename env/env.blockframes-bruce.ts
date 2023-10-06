export const production = false;

// Firebase
// ========

export const appUrl = {
  content: 'https://catalog-blockframes-bruce.web.app',
  market: 'https://festival-blockframes-bruce.web.app',
  crm: 'https://crm-blockframes-bruce.web.app',
  financiers: 'https://financiers-blockframes-bruce.web.app',
  waterfall: 'https://waterfall-blockframes-bruce.web.app',
};

const firebaseConfig = {
  apiKey: "AIzaSyDty3fra5v06b8R15JjDarwd-y9vP4DQIs",
  authDomain: "blockframes-bruce.firebaseapp.com",
  databaseURL: "https://blockframes-bruce.firebaseio.com",
  projectId: "blockframes-bruce",
  storageBucket: "blockframes-bruce.appspot.com",
  messagingSenderId: "308574859435",
  appId: "1:308574859435:web:6be97448e5508f5ab387ee",
  measurementId: "G-XXXXXXXXXX"
};

export const firebaseRegion = 'europe-west1';

export function firebase(app?: string) {
  return firebaseConfig
}

// Algolia
// =======
export const algolia = {
  appId: '8E9YO1I9HB',
  indexNameOrganizations: {
    festival: 'bruce_festival_org',
    financiers: 'bruce_financiers_org',
    catalog: 'bruce_catalog_org',
    waterfall: 'bruce_waterfall_org'
  },
  indexNameMovies: {
    festival: 'bruce_festival_movies',
    financiers: 'bruce_financiers_movies',
    catalog: 'bruce_catalog_movies'
  },
  indexNameUsers: 'bruce_users',
};

// Emails
// =======

export const supportEmails = {
  default: 'bdelorme@cascade8.com',
  catalog: 'bdelorme+catalog@cascade8.com',
  festival: 'bdelorme+festival@cascade8.com',
  financiers: 'bdelorme+financiers@cascade8.com',
  waterfall: 'bdelorme+waterfall@cascade8.com'
}

export const suffixE2ESupportEmail = 'bruce';

export const mailchimp = {
  server: 'us20',
  listId: 'efaccd1d28'
};

// Yandex
// =======

export const yandex = {
  festival: 0,
  financiers: 0,
  catalog: 0,
  waterfall: 0
};

// Hotjar
// ========
export const hotjar = {
  festival: 0,
  financiers: 0,
  catalog: 0,
  waterfall: 0
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

export const bigQueryAnalyticsTable = 'blockframes-bruce.analytics_194443494.events_';

// Archipel OrgIds
// ========

export const centralOrgId = {
  cascade8: 'jnbHKBP5YLvRQGcyQ8In',
  catalog: 'nBM8sy5EEAOtVBCX4nTJ',
};

// Import / Export parameters
// =======

export const backupBucket = 'bruce-backups';
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

// Airtable
// ========

export const airtable = {
  baseId: 'appMnFJkGjzVekGCO',
  dailyUpdate: false,
  tables: {
    users: 'tblNi63HYmtDbxoUN',
    orgs: 'tblrvNiBVmj3C3rpd',
    titles: 'tbleXDZKzcdRR9d0n',
    events: 'tblPiPESWuJJ4rsQv',
    contracts: 'tblaWQJ9Aum1GJB8S',
    buckets: 'tblJr55XsTYgdwj6Y',
    offers: 'tbl5AEwTnj0LF3pye',
    titleAnalytics: 'tblLxsQV4zEYxNtOz',
    orgAnalytics: 'tbl68ReEbxYeHKFjd',
    searchAnalytics: 'tblYl6kv4sQkwEFuh',
    movieAnalytics: 'tblWbXNCrikTB8QNe'
  }
};