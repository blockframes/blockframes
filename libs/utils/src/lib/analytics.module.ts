import { ErrorHandler, Injectable, NgModule } from '@angular/core';
import { sentryDsn } from '@env';
import * as Sentry from '@sentry/browser';

// Analytics
const providers: any[] = [];

/**
 * The sentry error handler will capture errors that we do
 * not catch explicitly and let the user file a report.
 */
@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  constructor() {
  }

  handleError(error) {
    const eventId = Sentry.captureException(error.originalError || error);
    Sentry.showReportDialog({ eventId });
  }
}

/**
 * Inject sentry if the API key (sentryDsn) is configured,
 * allows for development mode.
 */
if (sentryDsn) {
  Sentry.init({
    dsn: 'https://a5f8a3139c754fa088453dbd710d9418@sentry.io/1540126'
  });
  providers.push({ provide: ErrorHandler, useClass: SentryErrorHandler });
}

@NgModule({
  declarations: [],
  exports: [],
  providers
})
export class AnalyticsModule {
}
