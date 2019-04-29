export const production = true;
export const hmr = false;

export const firebase = {
  apiKey: 'AIzaSyBF8-76Sf4oOJfL-fwASGx8R51w9UkG0rw',
  authDomain: 'blockframes-demo-5.firebaseapp.com',
  databaseURL: 'https://blockframes-demo-5.firebaseio.com',
  projectId: 'blockframes-demo-5',
  storageBucket: 'blockframes-demo-5.appspot.com',
  messagingSenderId: '671401949747'
};

// export const network = 'homestead';
// export const baseEnsDomain = 'blockframes.eth';

// DEMO VERSION: We use our staging setup to run the current production.
export const network = 'goerli';
export const baseEnsDomain = 'blockframes.test';

export const contracts = {
  ipHash: '0x6f77765b18deac65dc55c3a38a112c9583e25185',
  testErc1077: '0x758011e12E57a81f93D1e59AdF8867463349A54d',
  ensResolver: '0xc1EA41786094D1fBE5aded033B5370d51F7a3F96'
};
