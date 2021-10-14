import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthQuery } from '@blockframes/auth/+state';
import { hasAnonymousIdentity } from '@blockframes/utils/event';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable({ providedIn: 'root' })
export class IdentityCheckGuard implements CanActivate {

  constructor(
    private authQuery: AuthQuery,
    private afAuth: AngularFireAuth,
    private router: Router,
  ) { }

  canActivate(next: ActivatedRouteSnapshot) {
    combineLatest([this.afAuth.authState, this.authQuery.anonymousCredentials$]).pipe(
      map(([userAuth, creds]) => {
        if ((userAuth && !userAuth.isAnonymous) || hasAnonymousIdentity(creds)) {
          // Redirect user to event view
          this.router.navigate([`events/${next.params.eventId}/r/i`]);
        } else if (creds?.role) {
          // Redirect user to identity or login page
          const page = creds.role === 'guest' ? 'identity' : 'login'
          this.router.navigate([`events/${next.params.eventId}/r/${page}`]);
        }
      })
    ).subscribe();
    return true;
  }

}
