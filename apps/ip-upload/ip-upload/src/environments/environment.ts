// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyCx3IsE1RdkJAy9SDAuaJy3JS1emDsBWR8',
    authDomain: 'blockframes-test.firebaseapp.com',
    databaseURL: 'https://blockframes-test.firebaseio.com',
    projectId: 'blockframes-test',
    storageBucket: 'blockframes-test.appspot.com',
    messagingSenderId: '902486579222'
  },
  network: 'ropsten' as 'ropsten',
  contracts: {
    scriptHash: '0x3a7bfeb49b2fd1399a38e748b3a18ab2a76b042a'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
