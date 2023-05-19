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

// Emails
// =======

export const supportEmails = {
  default: 'team@cascade8.com',
  catalog: 'support@archipelcontent.com',
  festival: 'support@archipelmarket.com',
  financiers: 'support@mediafinanciers.com'
}

export const mailchimp = {
  server: 'us4',
  listId: 'a537ee1f20'
};

// Yandex
// =======

export const yandex = {
  festival: 65689861,
  financiers: 70097020,
  catalog: 56105038
};

// Hotjar
// ========
export const hotjar = {
  festival: 2887217,
  financiers: 2887218,
  catalog: 2887089
}

// Intercom
// ========

export const intercomId = 'srwfltp4';

// Sentry
// =======

export const sentryEnv = 'production';
export const sentryDsn = 'https://a5f8a3139c754fa088453dbd710d9418@sentry.io/1540126';

// BigQuery
// ========

export const bigQueryAnalyticsTable = 'blockframes.analytics_193045559.events_';

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
// @see https://dashboard.jwplayer.com/p/M0ZSpeUV/media/YlSFNnkR
// ========

export const jwplayer = {
  propertyId: 'hYUWk8gd',
  playerId: 'lpkRdflk',
  testVideoId: 'YlSFNnkR'
}
