export const production = false;

// Firebase
// ========

export const appUrl = {
  content: 'https://staging.archipelcontent.com',
  market: 'https://staging.archipelmarket.com',
  financiers: 'https://staging.mediafinanciers.com',
  crm: 'https://staging.crm.blockframes.io',
};

const firebaseConfig = {
  apiKey: 'AIzaSyAmos48yDq2xnxy9OPtQpLMiE4NeyJlA5Y',
  authDomain: 'blockframes-staging.firebaseapp.com',
  databaseURL: 'https://blockframes-staging.firebaseio.com',
  projectId: 'blockframes-staging',
  storageBucket: 'blockframes-staging.appspot.com',
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
  default: {
    appId: "1:176629403574:web:e97f704329b41f233afb17",
    measurementId: "G-46P00JHXXK"
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
    festival: 'staging_festival_org',
    financiers: 'staging_financiers_org',
    catalog: 'staging_catalog_org'
  },
  indexNameMovies: {
    festival: 'staging_festival_movies',
    financiers: 'staging_financiers_movies',
    catalog: 'staging_catalog_movies',
  },
  indexNameUsers: 'staging_users',
};

// Support emails
// =======

export const supportEmails = {
  default: 'dev+staging@blockframes.io', // redirect to => blockframes.dev@gmail.com
  catalog: 'dev+staging_catalog@blockframes.io',
  festival: 'dev+staging_festival@blockframes.io',
  financiers: 'dev+staging_financiers@blockframes.io'
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
  festival: 0,
  financiers: 0,
  catalog: 0
}

// Intercom
// ========

export const intercomId = 'srwfltp4';

// OMDB
// =======

export const omdbApiKey = '4d1be897';

// Sentry
// =======

export const sentryEnv = 'staging';
export const sentryDsn = 'https://a5f8a3139c754fa088453dbd710d9418@sentry.io/1540126';

// Quorum
// ========

export const quorum = {
  archipelNode: {
    url: 'https://e0rf4hbql8-e0cy67u40h-rpc.de0-aws.kaleido.io',
    user: 'e0xwcvgknw',
    privateFor: 'PJg4NoFMk73mGCbkJ7/griaiKfkbS+edhfjO5PzztQs=',
    ethAddress: '0x7E5D163D7390A6068d44C8e2F3c2861B5133daa4',
  },
  pulsarlNode: {
    url: 'https://e0rf4hbql8-e0zhtusyfh-rpc.de0-aws.kaleido.io',
    user: 'e0xwcvgknw',
    privateFor: 'fnF4IPKvDcmM9bgmEKHoYjNyXG6cXqJjv806RK1F5y8=',
    ethAddress: '0x43c92D51ba8c0B83062F8116B036D6616ebe4746',
  },
  bankNode: {
    url: 'https://e0rf4hbql8-e0jbt507aa-rpc.de0-aws.kaleido.io',
    user: 'e0xwcvgknw',
    privateFor: 'Tj879+7P6IgX2UJTOLtWx5IjrPlABb7HO//kNNbnt28=',
    ethAddress: '0xe795245444d459CD0d8e12A26232646B5521e72F',
  },
}

// BigQuery  / Data Studio
// ========

export const bigQueryAnalyticsTable = 'blockframes-staging.analytics_194475853.events_';

// Data Studio
// ========

export const datastudio = {
  user: '1564ae35-5e86-4632-bfef-ef7f4db7a865/page/P9czB',
  users: '9789ffcf-a04c-43cb-8845-64a2c92f8a0d/page/00YOC',
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

export const backupBucket = 'staging-backups-bv8ys';
export const heavyChunkSize = 15;
export const chunkSize = 30;

// JwPlayer
// @see https://dashboard.jwplayer.com/#/content/detail?key=7R9ttesP&property=75507f12-83b6-11ea-ab11-3e60acbe08db&spotlight=default&tab=metadata&view=list
// ========

export const playerId = 'LVeBD5vf';
export const testVideoId = 'YlSFNnkR';
