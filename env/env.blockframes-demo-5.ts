export const production = true;
export const dev = false;
export const hmr = false;

// TODO issue#1146 AFM CODE
// is AFM disable ? -> false, it means that AFM is enabled = some piece of code will be skipped
export const AFM_DISABLE = false;

export const persistenceSettings = {
  // TODO(issue#846): change to synchronizeTabs when available (angularFire 5.2)
  experimentalTabSynchronization: true
};

// Firebase
// ========

export const appUrl = {
  content: 'https://demo5.archipelcontent.com',
  market: 'https://demo5.archipelmarket.com',
  crm: 'https://demo5.crm.blockframes.io',
}

export const firebase = {
  apiKey: 'AIzaSyBF8-76Sf4oOJfL-fwASGx8R51w9UkG0rw',
  authDomain: 'blockframes-demo-5.firebaseapp.com',
  databaseURL: 'https://blockframes-demo-5.firebaseio.com',
  projectId: 'blockframes-demo-5',
  storageBucket: 'blockframes-demo-5.appspot.com',
  messagingSenderId: '671401949747'
};

// Algolia
// =======

export const algolia = {
  appId: '8E9YO1I9HB',
  searchKey: '4a2990a293c0ee0bfde9ebd66270a47f',
  indexNameMovies: {
    festival: 'demo5_festival_movies',
    financiers: 'demo5_financiers_movies',
    catalog: 'demo5_catalog_movies',
  },
  indexNameOrganizations: {
    festival: 'demo5_festival_org',
    financiers: 'demo5_financiers_org',
    catalog: 'demo5_catalog_org'
  },
  indexNameUsers: 'demo5_users',
};

// Ethereum
// ========

export const network = 'goerli';
export const mnemonic = ''; // defined in functions.config, see backend-functions/environments
export const baseEnsDomain = 'blockframes.test';
export const factoryContract = 'factory2.eth';

// OMDB
// =======
export const omdbApiKey = '4d1be897';

// TODO(issue#847): change the address
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

export const backupBucket = 'demo5-backups';
export const sendgridAPIKey = null; // defined in functions.config, see backend-functions/environments


// BigQuery
// ========
export const bigQueryAnalyticsTable = 'blockframes-demo-5.analytics_197180636.events_';

// Archipel Content OrgId
// ======================
export const centralOrgID = "jnbHKBP5YLvRQGcyQ8In";

export const heavyChunkSize = 15;

export const chunkSize = 30;
