import { Injectable } from '@angular/core';
import { firebase } from '@env';
import { Severity, captureMessage } from '@sentry/browser';

interface SentryError {
  message: string;
  location: 'movie-tunnel';
  bugType: 'file-upload'
}

@Injectable({ providedIn: 'root' })
export class SentryService {

  /**
   * Sends a new error to Sentry
   * @param error 
   * @returns generated eventId
   */
  triggerError(error: SentryError) {
    return captureMessage(error.message, {
      level: Severity.Error,
      tags: {
        projectId: firebase().projectId,
        location: error.location,
        bugType: error.bugType
      },
    });
  }
}