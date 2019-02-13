export const environment = {
  production: true,
  hmr: false,
  firebase: {
    apiKey: 'AIzaSyCcUEsNlBgusJtyYAawoJAshnnHBruM1ss',
    authDomain: 'blockframes.firebaseapp.com',
    databaseURL: 'https://blockframes.firebaseio.com',
    projectId: 'blockframes',
    storageBucket: 'blockframes.appspot.com',
    messagingSenderId: '1080507348015'
  },
  network: 'ropsten' as 'ropsten',
  contracts: {
    ipHash: '0x6f77765b18deac65dc55c3a38a112c9583e25185'
  },
  pubsub: {
    projectID: 'blockframes-laurent-230215',
    topicRootName: 'eth-events'
  }
};
