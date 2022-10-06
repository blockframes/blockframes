import { Injectable } from '@angular/core';
import { firebase, sentryDsn } from '@env';
import { Severity, captureMessage } from '@sentry/browser';

interface SentryError {
  message: string;
  location: 'file-uploader-service' | 'global';
  bugType: 'invalid-metadata' | 'network'
}

@Injectable({ providedIn: 'root' })
export class SentryService {

  /**
   * Sends a new error to Sentry
   * @param error 
   * @returns generated eventId
   */
  triggerError(error: SentryError) {
    if (sentryDsn) {
      try {
        const eventId = captureMessage(error.message, {
          level: Severity.Error,
          tags: {
            projectId: firebase().projectId,
            location: error.location,
            bugType: error.bugType
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
