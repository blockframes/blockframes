import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthQuery, hasAnonymousIdentity, hasVerifiedAnonymousIdentity, isAnonymousEmailVerified } from '@blockframes/auth/+state';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventQuery } from '../+state';

@Injectable({ providedIn: 'root' })
export class IdentityCheckGuard implements CanActivate {

  constructor(
    private authQuery: AuthQuery,
    private afAuth: AngularFireAuth,
    private router: Router,
    private eventQuery: EventQuery
  ) { }

  canActivate(route: ActivatedRouteSnapshot) {
    combineLatest([
      this.afAuth.authState,
      this.authQuery.anonymousCredentials$,
      this.eventQuery.selectActive()
    ]).pipe(
      map(([userAuth, creds, event]) => {
        if ((userAuth && !userAuth.isAnonymous) || hasVerifiedAnonymousIdentity(creds, event.accessibility)) {
          // Redirect user to event view
          this.router.navigate([`event/${event.id}/r/i`], { queryParams: route.queryParams });
        } else if (creds?.role) {
          if (hasAnonymousIdentity(creds, event.accessibility) && !isAnonymousEmailVerified(creds, event.accessibility)) {
            this.router.navigate([`event/${event.id}/r/email-verify`], { queryParams: route.queryParams });
          } else {
            // Redirect user to identity or login page
            const identityPage = event.accessibility === 'invitation-only' ? 'email' : 'identity';
            const page = creds.role === 'guest' && event.accessibility !== 'private' ? identityPage : 'login';
            this.router.navigate([`event/${event.id}/r/${page}`], { queryParams: route.queryParams });
          }

        }
      })
    ).subscribe();
    return true;
  }

}
