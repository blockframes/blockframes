import { init as sentryInit, flush as sentryFlush, captureException, Severity } from '@sentry/node';
import { projectId, sentryDsn, sentryEnv } from '../environments/environment';
import { logger } from 'firebase-functions';
import { firebaseRegion } from './utils';


if (sentryDsn) {
  sentryInit({ dsn: sentryDsn, environment: sentryEnv });
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
  return (...args: any[]) => {
    return Promise.resolve(f(...args)).catch(async err => {

      // Send the exception to sentry IF we have a configuration.
      if (sentryDsn) {
        captureException(err, {
          level: Severity.Error,
          tags: {
            projectId,
            firebaseRegion,
            location: 'backend-functions',
          },
        }); 
        // the function runtime we are in might get killed immediately,
        // flush events.
        await sentryFlush();
      }

      // Even if sentry logger is enabled we display error into firebase console
      if (err.message) {
        const code = err.code ? `[${err.code}] ` : '';
        logger.error(`${code}${err.message}`);
      } else {
        logger.error(err);
      }

      throw err;
    });
  };
}
