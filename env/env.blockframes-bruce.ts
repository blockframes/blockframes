export const production = false;

// Firebase
// ========

export const appUrl = {
  content: 'https://catalog-blockframes-bruce.web.app',
  market: 'https://festival-blockframes-bruce.web.app',
  crm: 'https://crm-blockframes-bruce.web.app',
  financiers: 'https://financiers-blockframes-bruce.web.app',
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
    catalog: 'bruce_catalog_org'
  },
  indexNameMovies: {
    festival: 'bruce_festival_movies',
    financiers: 'bruce_financiers_movies',
    catalog: 'bruce_catalog_movies',
  },
  indexNameUsers: 'bruce_users',
};

// Emails
// =======

export const supportEmails = {
  default: 'bdelorme@cascade8.com',
  catalog: 'bdelorme+catalog@cascade8.com',
  festival: 'bdelorme+festival@cascade8.com',
  financiers: 'bdelorme+financiers@cascade8.com'
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
  baseId: 'approgrPg7O0KaTCn',
  dailyUpdate: false,
  tables: {
    users: 'tblsjHLcyaIIHnBUm',
    orgs: 'tbl6wo06vay88TEpM',
    titles: 'tblTYeHf90sWnZq0W',
    events: 'tblujqmnwiYOAhFQ4',
    contracts: 'tblPXrrEaiB6czO8r',
    reports: 'tblrWS0z71v6hJbdu',
    buckets: 'tblosGNs2HdlJmw6x',
    offers: 'tblKBfeoX7fQbTCyN',
    titleAnalytics: 'tblqy3yqEnT33DGO8',
    orgAnalytics: 'tblL9sW9LldjdASjM',
    searchAnalytics: 'tblDmH20Eg5p2uSuQ',
    movieAnalytics: 'tblBcyv716zY7Y3NN'
  }
};