export const production = true;

export const persistenceSettings = {
  synchronizeTabs: true
};

// Firebase
// ========

export const appUrl = {
  content: 'https://archipelcontent.com',
  market: 'https://archipelmarket.com',
  financiers: 'https://mediafinanciers.com',
  crm: 'https://crm.blockframes.io',
};

export const firebaseConfig = {
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
  }
}

export function firebase(app: keyof typeof appConfigs = 'festival') {
  return {
    ...firebaseConfig,
    ...appConfigs[app]
  }
}



// Algolia
// =======

export const algolia = {
  appId: '8E9YO1I9HB',
  searchKey: '4a2990a293c0ee0bfde9ebd66270a47f',
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

// Support emails 
// =======

export const supportEmails = {
  default: 'team@cascade8.com',
  catalog: 'support@archipelcontent.com',
  festival: 'support@archipelmarket.com',
  financiers: 'support@mediafinanciers.com'
}

// Yandex 
// =======

export const yandexId = 56105038;

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

export const sentryEnv = 'production';
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

// BigQuery
// ========

export const bigQueryAnalyticsTable = 'blockframes.analytics_193045559.events_';

// Archipel Content OrgId
// ========

export const centralOrgID = "jnbHKBP5YLvRQGcyQ8In";

// Import / Export parameters
// =======

export const backupBucket = 'blockframes-backups';
export const heavyChunkSize = 7;
export const chunkSize = 15;
