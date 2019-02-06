// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  network: 'ropsten' as 'ropsten',
  contracts: {
    ipHash: '0x6f77765b18deac65dc55c3a38a112c9583e25185'
  },
  pubsub: {
    projectID: 'blockframes-laurent-230215',
    topicRootName: 'eth-events'
  },
};
