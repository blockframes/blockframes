export const production = false;
export const dev = false;
export const hmr = false; // hot-reloading: use true for local dev
export const persistenceSettings = {
  synchronizeTabs: true
};

// Firebase
// ========

//base: https://blockframes-francois.firebaseapp.com
export const appUrl = {
  content: 'https://blockframes-francois.web.app',
  market: 'https://blockframes-francois-festival.web.app',
  financiers: 'https://blockframes-francois-financier.web.app',
  crm: 'https://blockframes-francois-crm.web.app',
};

// Emulator
export const emulatorConfig = {
  functionsEmulatorURL: 'http://localhost:5001',
  firestoreConfig: { 
    host: 'localhost:8080', 
    ssl: false 
  }
};

// Here you must add your firebase config
export const firebase = {
  apiKey: "AIzaSyD1qjU9feHzxAFg96L4VouE9_nt9nFGg0s",
  authDomain: "blockframes-francois.firebaseapp.com",
  databaseURL: "https://blockframes-francois.firebaseio.com",
  projectId: "blockframes-francois",
  storageBucket: "blockframes-francois.appspot.com",
  messagingSenderId: "309694417970",
  appId: "1:309694417970:web:3e81f3430c9e0a5c",
  measurementId: "G-FJK6DBB02R"
};

// Algolia
// =======
// Here you must add your Algolia config if you have one
// You can set up your Algolia config on this page: https://www.notion.so/cascade8/Algolia-1c7ac7f04d0b4981b4685f047c1a3b88
export const algolia = {
  appId: '8E9YO1I9HB',
  searchKey: '4a2990a293c0ee0bfde9ebd66270a47f',
  // indexNameOrganizations: 'francois_orgs',
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

// Ethereum
// ========
// Here you must add your Ethereum config if you have one
export const network = 'goerli';
export const mnemonic = '';
export const baseEnsDomain = 'blockframes.test';
export const factoryContract = 'factory2.eth';

export const contracts = {
  ipHash: '0x6f77765b18deac65dc55c3a38a112c9583e25185',
  testErc1077: '0x758011e12E57a81f93D1e59AdF8867463349A54d',
  ensResolver: '0xc1EA41786094D1fBE5aded033B5370d51F7a3F96'
};

export const relayer = {
  registryAddress: '0x112234455c3a32fd11230c42e7bccd4a84e02010',
  resolverAddress: '0xc1EA41786094D1fBE5aded033B5370d51F7a3F96',
  network,
  baseEnsDomain,
  factoryContract
};

// Functions
// =========
export const backupBucket = 'francois-backups';
export const sendgridAPIKey = '';
export const omdbApiKey = '';
export const AFM_DISABLE = false;
// This one is for Intercom. If you don't want to use Intercom you can put a null string
export const intercomId = '';
// For Yandex, put a random number
export const yandexId = 1234;
// Sentry can be null but it catch error we maybe don't see
export const sentryDsn = '';
export const sentryEnv = undefined;


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


// BigQuery
// ========
export const bigQueryAnalyticsTable = 'blockframes-francois.analytics_229093027.events_';

// Archipel Content OrgId
// ======================
export const centralOrgID = "q8QyyHREqvLNtmh11ZLW";



// Chunks base to run heavy calculation
export const heavyChunkSize = 7;

export const chunkSize = 15;