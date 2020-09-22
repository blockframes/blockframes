
import { firebase } from '@env';

export const environment = {
  production: false,
  firebase: {
    ...firebase,
    appId: "1:309694417970:web:d1a39b02d25a5edfe8802b",
    measurementId: "G-6CDHMTRH4T"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/dist/zone-error';  // Included with Angular CLI.
