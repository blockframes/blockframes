import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthQuery, AuthService } from '@blockframes/auth/+state';
import { hasAnonymousIdentity } from '@blockframes/utils/event';
import { EventService } from '../+state';

@Injectable({ providedIn: 'root' })
export class EventAccessGuard implements CanActivate {

  constructor(
    private service: EventService,
    private authQuery: AuthQuery,
    private authService: AuthService,
    private router: Router,
    private afAuth: AngularFireAuth,
  ) { }

  canActivate(route: ActivatedRouteSnapshot) {
    // Listenning for authState changes
    this.listenOnCurrentUserState();

    /**
    * With eventId and invitationId we can now evaluate what should be the next page
    */
    return this.service.getValue(route.params.eventId as string)
      .then(async event => {
        const currentUser = await this.authService.user;
        switch (event.accessibility) {
          case 'public':
          case 'invitation-only': {
            const anonymousCredentials = this.authQuery.anonymousCredentials;
            // @TODO #6756 event is public, no invitation required, required if invitation-only
            if (currentUser.isAnonymous) {
              return hasAnonymousIdentity(anonymousCredentials, event.accessibility) || this.router.navigate([`/events/${event.id}`]);
            }
            return true;
          }
          case 'private':
            if (!currentUser.isAnonymous) {
              return true;
            } else {
              // @TODO #6756 if invitationId  in params => redirect to this.router.navigate([`/events/${event.id}/r/login`])
            }

        }
      }).catch(() => {
        // Something went wrong, we redirect user to homepage
        this.router.navigate(['/']);
        return false;
      });

  }

  private listenOnCurrentUserState() {
    let user;
    this.afAuth.authState.subscribe(u => {
      if (user && !u) {
        this.router.navigate(['/']);
      } else {
        user = u;
      }
    });
  }
}

