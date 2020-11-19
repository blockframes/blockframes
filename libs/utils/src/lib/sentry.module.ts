import { ErrorHandler, Injectable, NgModule } from '@angular/core';
import { sentryDsn, sentryEnv } from '@env';
import * as Sentry from '@sentry/browser';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { MatSnackBarModule } from '@angular/material/snack-bar';

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
          username: `${user.firstName} ${user.lastName}`
        });
      });
    });
  }

  handleError(error) {
    Sentry.captureException(error.originalError || error);
  }
}

// Init and add the Sentry ErrorHandler.
Sentry.init({
  dsn: sentryDsn,
  environment: sentryEnv,
});

@NgModule({
  imports: [MatSnackBarModule],
  providers: [{ provide: ErrorHandler, useClass: SentryErrorHandler }]
})
export class SentryModule { }
