import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '@blockframes/auth/+state';
import { hasAnonymousIdentity } from '@blockframes/auth/+state/auth.model';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventQuery } from '../+state';

@Injectable({ providedIn: 'root' })
export class IdentityCheckGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private afAuth: AngularFireAuth,
    private router: Router,
    private eventQuery: EventQuery,
    private snackBar: MatSnackBar,
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log(state.url);
    const event = this.eventQuery.getActive();
    return combineLatest([
      this.afAuth.authState,
      this.authService.anonymousCredentials$
    ]).pipe(
      map(([userAuth, creds]) => {
        if (!event) {
          const message = 'Incorrect event';
          this.snackBar.open(message, 'close', { duration: 5000 });

          return this.router.createUrlTree(['/']);
        }

        if (userAuth?.isAnonymous && event.accessibility === 'invitation-only' && (!route.queryParams.i || !creds.invitationId)) {
          const message = 'Missing invitation parameter';
          this.snackBar.open(message, 'close', { duration: 5000 });
          return this.router.createUrlTree(['/']);
        }
        console.log('la');
        if ((userAuth && !userAuth.isAnonymous) || hasAnonymousIdentity(creds, event.accessibility)) {
          // Redirect user to event view
          return this.router.createUrlTree([`/event/${event.id}/r/i`], { queryParams: route.queryParams });
        } else if (creds?.role) {
          // Redirect user to identity or login page
          const identityPage = event.accessibility === 'invitation-only' ? 'email' : 'identity';
          const page = creds.role === 'guest' && event.accessibility !== 'private' ? identityPage : 'login';
          return this.router.createUrlTree([`/event/${event.id}/r/${page}`], { queryParams: route.queryParams });
        }
        console.log('ici');
        return true;
      })
    );
  }

}
