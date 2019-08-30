export const production = true;
export const hmr = false;

export const persistenceSettings = {
  // TODO(issue#846): change to synchronizeTabs when available (angularFire 5.2)
  experimentalTabSynchronization: true
};

// Firebase
// ========

export const appUrl = 'https://demo2.blockframes.io';

export const firebase = {
  apiKey: 'AIzaSyBmPF29hs2PPo4-4PjlR__ng-X14URyM7Q',
  authDomain: 'blockframes-demo-2.firebaseapp.com',
  databaseURL: 'https://blockframes-demo-2.firebaseio.com',
  projectId: 'blockframes-demo-2',
  storageBucket: 'blockframes-demo-2.appspot.com',
  messagingSenderId: '185137976939'
};

// Algolia
// =======

export const algolia = {
  appId: 'W5ACHF3Z7Z',
  searchKey: '102e09194402cf082527d84476c5fc25',
  indexNameOrganizations: 'orgs'
};

// Ethereum
// ========

export const network = 'goerli';
export const mnemonic = ''; // defined in functions.config, see backend-functions/environments
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

// Functions
// =========

export const backupBucket = 'demo2-backups';
export const sendgridAPIKey = null; // defined in functions.config, see backend-functions/environments
