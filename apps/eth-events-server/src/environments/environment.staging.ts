export const environment = {
  production: true,
  firebase: {
    apiKey: 'AIzaSyAmos48yDq2xnxy9OPtQpLMiE4NeyJlA5Y',
    authDomain: 'blockframes-staging.firebaseapp.com',
    databaseURL: 'https://blockframes-staging.firebaseio.com',
    projectId: 'blockframes-staging',
    storageBucket: 'blockframes-staging.appspot.com',
    messagingSenderId: '176629403574'
  },
  network: 'ropsten' as 'ropsten',
  contracts: {
    ipHash: '0x6f77765b18deac65dc55c3a38a112c9583e25185'
  },
  pubsub: {
    projectID: 'blockframes-staging',
    topicRootName: 'eth-events'
  }
};
