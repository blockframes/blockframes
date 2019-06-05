export const production = false;

export const hmr = false; // hot-reloading: use true for local dev

// Firebase
// ========

export const firebase = {
  apiKey: "AIzaSyATQHmR6iTCgaBkCXansUcA3pJma3jCgC0",
  authDomain: "blockframes-ci.firebaseapp.com",
  databaseURL: "https://blockframes-ci.firebaseio.com",
  projectId: "blockframes-ci",
  storageBucket: "blockframes-ci.appspot.com",
  messagingSenderId: "973979650792",
};

// Ethereum
// ========

export const network = 'goerli';
export const baseEnsDomain = 'blockframes.test';

// TODO : change the address
export const contracts = {
  ipHash: '0x6f77765b18deac65dc55c3a38a112c9583e25185',
  testErc1077: '0x758011e12E57a81f93D1e59AdF8867463349A54d',
  ensResolver: '0xc1EA41786094D1fBE5aded033B5370d51F7a3F96'
};

// Functions
// =========

export const sendgridAPIKey = process.env.SENDGRID_API_KEY;
export const backupBucket = 'staging-backups';

export const relayer = {
  registryAddress: '0x112234455c3a32fd11230c42e7bccd4a84e02010',
  resolverAddress: '0xc1EA41786094D1fBE5aded033B5370d51F7a3F96',
  baseDomain: 'blockframes.test',
  network,
  mnemonic: process.env.MNEMONIC
};
