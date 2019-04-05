export const production = true;
export const hmr = false;

export const firebase = {
  apiKey: 'AIzaSyCcUEsNlBgusJtyYAawoJAshnnHBruM1ss',
  authDomain: 'blockframes.firebaseapp.com',
  databaseURL: 'https://blockframes.firebaseio.com',
  projectId: 'blockframes',
  storageBucket: 'blockframes.appspot.com',
  messagingSenderId: '1080507348015'
};

export const network = 'homestead';

// TODO : change the address
export const contracts = {
  ipHash: '0x6f77765b18deac65dc55c3a38a112c9583e25185',
  testErc1077: {
    address: {
      goerli: '0x758011e12E57a81f93D1e59AdF8867463349A54d',
      ropsten: '0x01f1FB103ebc213D9f0dBBfaF9AC3a43D0f496E3'
    },
    baseEnsDomain: {
      goerli: 'blockframes.test',
      ropsten: 'blockframe.test'
    }
  }
};
