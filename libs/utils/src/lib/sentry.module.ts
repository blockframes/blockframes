import { ErrorHandler, Injectable, NgModule } from '@angular/core';
import { sentryDsn, sentryEnv } from '@env';
import * as Sentry from '@sentry/browser';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SentryService } from './sentry.service';
import { appVersion } from './constants';
import { FireAuth, FirestoreService, fromRef } from 'ngfire';
import { User } from '@blockframes/model';
import { map, of, switchMap } from 'rxjs';
import { DocumentReference } from 'firebase/firestore';

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  constructor(
    private authService: FireAuth<User>,
    private firestore: FirestoreService,
    private sentryService: SentryService,
  ) {
    this.authService.user$.pipe(switchMap(u => {
      if (!u?.uid) return of(undefined);
      const ref = this.firestore.getRef(`users/${u.uid}`) as DocumentReference<User>;
      return fromRef(ref).pipe(map(snap => snap.data()));
    })).subscribe(user => {
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
    } else if (error?.message === 'LinearAnimationInstance instance already deleted') {
      // #9450 https://github.com/dappsnation/ng-rive/issues/46
      this.sentryService.triggerWarning({ message: `ng-rive ${error.message}`, bugType: 'animations', location: 'global' });
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
