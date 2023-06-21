﻿export const production = false;

// Firebase
// ========

export const appUrl = {
  content: 'https://staging.archipelcontent.com',
  market: 'https://staging.archipelmarket.com',
  financiers: 'https://staging.mediafinanciers.com',
  crm: 'https://staging.crm.blockframes.io',
  waterfall: 'https://staging.blockframes.io',
};

const firebaseConfig = {
  apiKey: 'AIzaSyAmos48yDq2xnxy9OPtQpLMiE4NeyJlA5Y',
  authDomain: 'blockframes-staging.firebaseapp.com',
  databaseURL: 'https://blockframes-staging.firebaseio.com',
  projectId: 'blockframes-staging',
  storageBucket: 'blockframes-staging',
  messagingSenderId: '176629403574',
};

const appConfigs = {
  festival: {
    appId: "1:176629403574:web:6b87a6bd036a31923afb17",
    measurementId: "G-YPFLZVR4XP"
  },
  catalog: {
    appId: "1:176629403574:web:d4d965add159857c3afb17",
    measurementId: "G-91803TC0PB"
  },
  financiers: {
    appId: "1:176629403574:web:d581aebb64c37aeb3afb17",
    measurementId: "G-K6EPHB6MQ5"
  },
  cms: {
    appId: "1:176629403574:web:5fdf3cbcb8eb67803afb17",
    measurementId: "G-QCXWY2XS8V"
  },
  crm: {
    appId: "1:176629403574:web:eacdbef9a019b1c33afb17",
    measurementId: "G-WFBNNFQZZM"
  },
  waterfall: { // TODO #9257 change this
    appId: "1:176629403574:web:e97f704329b41f233afb17",
    measurementId: "G-XXXXXXXXXX"
  },
  default: {
    appId: "1:176629403574:web:e97f704329b41f233afb17",
    measurementId: "G-46P00JHXXK"
  }
}

export const firebaseRegion = 'europe-west1';

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
  indexNameOrganizations: {
    festival: 'staging_festival_org',
    financiers: 'staging_financiers_org',
    catalog: 'staging_catalog_org',
    waterfall: 'staging_waterfall_org',
  },
  indexNameMovies: {
    festival: 'staging_festival_movies',
    financiers: 'staging_financiers_movies',
    catalog: 'staging_catalog_movies'
  },
  indexNameUsers: 'staging_users',
};

// Emails
// =======

export const supportEmails = {
  default: 'dev+staging@blockframes.io', // redirect to => blockframes.dev@gmail.com
  catalog: 'dev+staging_catalog@blockframes.io',
  festival: 'dev+staging_festival@blockframes.io',
  financiers: 'dev+staging_financiers@blockframes.io',
  waterfall: 'dev+staging_waterfall@blockframes.io',
}

export const suffixE2ESupportEmail = undefined;

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

export const intercomId = 'srwfltp4';

// Sentry
// =======

export const sentryEnv = 'staging';
export const sentryDsn = 'https://a5f8a3139c754fa088453dbd710d9418@sentry.io/1540126';

// BigQuery  / Data Studio
// ========

export const bigQueryAnalyticsTable = 'blockframes-staging.analytics_194475853.events_';

// Archipel OrgIds
// ========

export const centralOrgId = {
  cascade8: 'jnbHKBP5YLvRQGcyQ8In',
  catalog: 'nBM8sy5EEAOtVBCX4nTJ',
};

// Import / Export parameters
// =======

export const backupBucket = 'staging-backups-bv8ys';
export const heavyChunkSize = 15;
export const chunkSize = 30;

// JwPlayer
// @see https://dashboard.jwplayer.com/p/M0ZSpeUV/media/YlSFNnkR
// ========

export const jwplayer = {
  propertyId: 'M0ZSpeUV',
  playerId: 'LVeBD5vf',
  testVideoId: 'YlSFNnkR'
}
