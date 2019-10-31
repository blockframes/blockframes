export const production = false;
export const hmr = false; // hot-reloading: use true for local dev

// TODO issue#1146 AFM CODE
// is AFM disable ? -> false, it means that AFM is enabled = some piece of code will be skipped
export const AFM_DISABLE = false;

export const persistenceSettings = {
  synchronizeTabs: true
};

// Firebase
// ========

export const appUrl = 'https://staging.blockframes.io';

export const firebase = {
  apiKey: 'AIzaSyAmos48yDq2xnxy9OPtQpLMiE4NeyJlA5Y',
  authDomain: 'blockframes-staging.firebaseapp.com',
  databaseURL: 'https://blockframes-staging.firebaseio.com',
  projectId: 'blockframes-staging',
  storageBucket: 'blockframes-staging.appspot.com',
  messagingSenderId: '176629403574'
};

// Algolia
// =======

export const algolia = {
  appId: '8E9YO1I9HB',
  searchKey: '102e09194402cf082527d84476c5fc25',
  indexNameOrganizations: 'staging_orgs'
};

// Ethereum
// ========

export const network = 'goerli';
export const mnemonic = '';
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

export const backupBucket = 'staging-backups';
export const sendgridAPIKey = null; // defined in functions.config, see backend-functions/environments

// Sendgrid Emails

export const templateIds = {
  welcomeMessage: 'd-eb8e1eb7c5a24eb8af1d2d32539ad714',
  userVerifyEmail: 'd-81438bdf511b43cfa866ca63a45a02ae',
  orgInviteUser: 'd-7a0edb51795c493d9514fe4a595b40ac',
  userCredentials: 'd-a34ce9ea59c5477f9feae8f556157b6b',
  orgAccepted: 'd-8c5f7009cd2f4f1b877fa168b4efde48',
  joinAnOrgPending: 'd-88665c2583dc46ea85588a39fa8ca1ee',
  joinYourOrg: 'd-b1ab5d21def145ccb759520e2d984436',
  resetPassword: 'd-6a0710945bc841ffb6955e3dc202704c',
  userHasJoined: 'd-f84d8c5a70884316870ca4ef657e368f',
  userRequestAccepted: 'd-d32b25a504874a708de6bfc50a1acba7',
}
