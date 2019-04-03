export const production = false;

export const hmr = false; // hot-reloading: use true for local dev

export const firebase = {
  apiKey: "AIzaSyAQz6XY6znADhrGaE1yz-04Lom-I8DNubo",
  authDomain: "blockframes-hugo.firebaseapp.com",
  databaseURL: "https://blockframes-hugo.firebaseio.com",
  projectId: "blockframes-hugo",
  storageBucket: "",
  messagingSenderId: "118094245365"
}

export const network = 'goerli';

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
    },
    resolver: {
      goerli: '0xc1EA41786094D1fBE5aded033B5370d51F7a3F96',
      ropsten: '0xde469c7106a9FBC3fb98912bB00be983a89bDDca',
    }
  }
};
