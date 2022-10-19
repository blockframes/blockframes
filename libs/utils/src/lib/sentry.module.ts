import { ErrorHandler, Injectable, NgModule } from '@angular/core';
import { sentryDsn, sentryEnv } from '@env';
import * as Sentry from '@sentry/browser';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '@blockframes/auth/service';
import { SentryService } from './sentry.service';
import { appVersion } from './constants';

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  constructor(
    private authService: AuthService,
    private sentryService: SentryService,
  ) {
    this.authService.profile$.subscribe(user => {
      if (!user) {
        Sentry.configureScope(scope => {
          scope.setTag('appVersion', appVersion);
        });
        return;
      }

      Sentry.configureScope(scope => {
        scope.setUser({
          email: user.email,
          id: user.uid,
          username: `${user.firstName} ${user.lastName}`
        });
        scope.setTag('appVersion', appVersion);
      });
    });
  }

  handleError(error) {
    if (sentryEnv as unknown !== 'production') {
      console.error(error);
    }

    if (error?.message.includes('ChunkLoadError')) {
      this.sentryService.triggerError({ message: 'ChunkLoadError', bugType: 'network', location: 'global' });
    } else {
      Sentry.captureException(error.originalError || error);
    }
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
