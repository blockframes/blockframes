import { init as sentryInit, flush as sentryFlush, captureException } from '@sentry/node';
import { sentryDsn } from '../environments/environment';

if (sentryDsn) {
  console.info("using sentry:", sentryDsn, "to log errors");
  sentryInit({ dsn: sentryDsn });
}

/**
 * Decorate a function to catch & log errors with sentry,
 * IF sentry was loaded.
 *
 * We have to use this function explicitly instead of sentry's catch-all
 * logger: firebase functions do not allow for error handler override
 * as of today (2019-07-02).
 */
export function logErrors(f: any): any {
  console.log('avant try');
  return async (...args: any[]) => {
    try {
      console.log('dans try');
      return await f(...args);
    } catch (err) {
      console.log('dans catch');
      // Send the exception to sentry IF we have a configuration.
      if (sentryDsn) {
        captureException(err);
        // the function runtime we are in might get killed immediately,
        // flush events.
        await sentryFlush();
      }
      throw err;
    }
  };
}
