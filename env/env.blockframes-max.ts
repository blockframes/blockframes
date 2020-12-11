export const production = false;

export const persistenceSettings = {
  synchronizeTabs: true
};

// Firebase
// ========

export const appUrl = {
  content: 'https://blockframes-max.web.app',
  market: 'http://blockframes-max-festival.web.app',
  crm: 'https://blockframes-max-crm.web.app',
  financiers: 'http://blockframes-max-financiers.web.app'
};

const firebaseConfig = {
  apiKey: "AIzaSyCOqOXtxD6Rm7VHa3IoMQt7Lsm0ts3tnLw",
  authDomain: "blockframes-max.firebaseapp.com",
  databaseURL: "https://blockframes-max.firebaseio.com",
  projectId: "blockframes-max",
  storageBucket: "blockframes-max.appspot.com",
  messagingSenderId: "268195483565"
};

const appSpecificConfigs = {
  festival: {
    appId: "1:268195483565:web:c288eb087c3e9fb8179b24",
    measurementId: "G-HE97S1CHVM"
  },
  financiers: {
    appId: "1:268195483565:web:ffc1e972dc97ab0c179b24",
    measurementId: "G-Y7X6VCQQC1"
  },
  catalog: {
    appId: "1:268195483565:web:8caa91b304c743d0",
    measurementId: "G-22EMF70SGN"
  }
}

export function firebase(app: keyof typeof appSpecificConfigs = 'festival') {
  return {
    ...firebaseConfig,
    ...appSpecificConfigs[app]
  }
}


// Algolia
// =======

export const algolia = {
  appId: '8E9YO1I9HB',
  searchKey: '4a2990a293c0ee0bfde9ebd66270a47f',
  indexNameOrganizations: {
    festival: 'max_festival_org',
    financiers: 'max_financiers_org',
    catalog: 'max_catalog_org',
  },
  indexNameMovies: {
    festival: 'max_festival_movies',
    financiers: 'max_financiers_movies',
    catalog: 'max_catalog_movies',
  },
  indexNameUsers: 'max_users'
};

// Support emails 
// =======

export const supportEmails = {
  default: 'mfritz@cascade8.com',
  catalog: 'mfritz+catalog@cascade8.com',
  festival: 'mfritz+festival@cascade8.com',
  financiers: 'mfritz+financiers@cascade8.com'
}

// Yandex 
// =======

export const yandexId = 0;

// Intercom
// ========

export const intercomId = 'srwfltp4';

// Ethereum
// ========

export const network = 'goerli';
export const baseEnsDomain = 'blockframes.test';
export const factoryContract = 'factory2.eth';

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

// OMDB
// =======

export const omdbApiKey = '4d1be897';

// Sentry 
// =======

export const sentryEnv = undefined;
export const sentryDsn = undefined;

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

export const bigQueryAnalyticsTable = 'blockframes-max.analytics_205113694.events_';

// Archipel Content OrgId
// ========

export const centralOrgID = "jnbHKBP5YLvRQGcyQ8In";

// Import / Export parameters
// =======

export const backupBucket = 'max-backups';
export const heavyChunkSize = 10;
export const chunkSize = 25;
