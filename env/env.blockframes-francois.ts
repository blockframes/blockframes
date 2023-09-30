export const production = false;

// Firebase
// ========

export const appUrl = {
  content: 'https://blockframes-francois.web.app',
  market: 'https://blockframes-francois-festival.web.app',
  financiers: 'https://blockframes-francois-financier.web.app',
  crm: 'https://blockframes-francois-crm.web.app',
};

const firebaseConfig = {
  apiKey: "AIzaSyD1qjU9feHzxAFg96L4VouE9_nt9nFGg0s",
  authDomain: "blockframes-francois.firebaseapp.com",
  databaseURL: "https://blockframes-francois.firebaseio.com",
  projectId: "blockframes-francois",
  storageBucket: "blockframes-francois.appspot.com",
  messagingSenderId: "309694417970",
  appId: "1:309694417970:web:3e81f3430c9e0a5c",
  measurementId: "G-FJK6DBB02R"
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
    festival: 'francois_festival_org',
    financiers: 'francois_financiers_org',
    catalog: 'francois_catalog_org'
  },
  indexNameMovies: {
    festival: 'francois_festival_movies',
    financiers: 'francois_financiers_movies',
    catalog: 'francois_catalog_movies',
  },
  indexNameUsers: 'francois_users'
};

// Emails
// =======

export const supportEmails = {
  default: 'fguezengar@cascade8.com',
  catalog: 'fguezengar+catalog@cascade8.com',
  festival: 'fguezengar+festival@cascade8.com',
  financiers: 'fguezengar+financiers@cascade8.com'
}

export const suffixE2ESupportEmail = 'francois';

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

export const bigQueryAnalyticsTable = 'blockframes-francois.analytics_229093027.events_';

// Archipel OrgIds
// ========

export const centralOrgId = {
  cascade8: 'jnbHKBP5YLvRQGcyQ8In',
  catalog: 'nBM8sy5EEAOtVBCX4nTJ',
};

// Import / Export parameters
// =======

export const backupBucket = 'francois-backups';
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

export const baseId = undefined; // replace by value in prod env for local use
export const tables = {
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
};