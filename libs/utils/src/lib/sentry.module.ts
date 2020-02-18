import { ErrorHandler, Injectable, NgModule } from '@angular/core';
import { sentryDsn } from '@env';
import * as Sentry from '@sentry/browser';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  constructor(private authQuery: AuthQuery) {
    this.authQuery.user$.subscribe(user => {
      if (!user) {
        return;
      }

      Sentry.configureScope(scope => {
        scope.setUser({
          email: user.email,
          id: user.uid,
          username: `${user.name} ${user.surname}`
        });
      });
    });
  }

  handleError(error) {
    const eventId = Sentry.captureException(error.originalError || error);
    const { uid, email } = this.authQuery.user || { uid: undefined, email: undefined };
    Sentry.showReportDialog({ eventId, user: { email } });
  }
}

// Init and add the Sentry ErrorHandler.
Sentry.init({
  dsn: sentryDsn
});

@NgModule({
  providers: [{ provide: ErrorHandler, useClass: SentryErrorHandler }]
})
export class SentryModule {}
