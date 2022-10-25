import { init as sentryInit, flush as sentryFlush, captureException, captureMessage, SeverityLevel } from '@sentry/node';
import { projectId, sentryDsn, sentryEnv } from '../environments/environment';
import { logger } from 'firebase-functions';
import { firebaseRegion } from './utils';
import { SentryError } from '@blockframes/model';


if (sentryDsn) {
  sentryInit({ dsn: sentryDsn, environment: sentryEnv });
}

const location = 'backend-functions';
/**
 * Decorate a function to catch & log errors with sentry,
 * IF sentry was loaded.
 *
 * We have to use this function explicitly instead of sentry's catch-all
 * logger: firebase functions do not allow for error handler override
 * as of today (2019-07-02).
 */
export function logErrors(f) {
  return (...args) => {
    return Promise.resolve(f(...args)).catch(async err => {

      // Send the exception to sentry IF we have a configuration.
      if (sentryDsn) {
        captureException(err, {
          level: 'error',
          tags: {
            projectId,
            firebaseRegion,
            location,
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

export async function triggerError(error: Partial<SentryError>, level: SeverityLevel = 'error') {
  if (sentryDsn) {
    try {
      const eventId = captureMessage(error.message, {
        level,
        tags: {
          projectId,
          location,
          bugType: error.bugType,
        },
      });

      // the function runtime we are in might get killed immediately,
      // flush events.
      await sentryFlush();
      console.log(`New Sentry event created: ${eventId} - ${error.message}`);
      return eventId;
    } catch {
      console.log('Error while pushing event to Sentry');
    }
  } else {
    console.log('Skipped Sentry event creation. sentryDsn not set');
  }
}
