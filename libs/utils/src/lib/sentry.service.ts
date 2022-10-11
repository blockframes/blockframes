import { Injectable } from '@angular/core';
import { firebase, sentryDsn } from '@env';
import { Severity, captureMessage } from '@sentry/browser';
import { appVersion } from './constants';

interface SentryError {
  message: string;
  location: 'file-uploader-service' | 'global';
  bugType: 'invalid-metadata' | 'network' | 'front-version'
}

@Injectable({ providedIn: 'root' })
export class SentryService {

  /**
   * Sends a new error to Sentry
   * @param error 
   * @returns generated eventId
   */
  triggerError(error: SentryError) {
    return this.capture(error);
  }

  /**
 * Sends a new warning to Sentry
 * @param error 
 * @returns generated eventId
 */
  triggerWarning(error: SentryError) {
    return this.capture(error, Severity.Warning);
  }

  private capture(error: SentryError, level: Severity = Severity.Error) {
    if (sentryDsn) {
      try {
        const eventId = captureMessage(error.message, {
          level,
          tags: {
            projectId: firebase().projectId,
            location: error.location,
            bugType: error.bugType,
            appVersion: appVersion
          },
        });
        console.log(`New Sentry event created: ${eventId} - ${error.message}`);
        return eventId;
      } catch {
        console.log('Error while pushing event to Sentry');
      }
    } else {
      console.log('Skipped Sentry event creation. sentryDsn not set');
    }
  }
}
