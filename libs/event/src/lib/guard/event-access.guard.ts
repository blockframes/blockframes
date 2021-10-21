import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthQuery, AuthService, AuthStore, hasAnonymousIdentity, hasVerifiedAnonymousIdentity } from '@blockframes/auth/+state';
import { createInvitation, InvitationService } from '@blockframes/invitation/+state';
import { combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { EventService } from '../+state';

@Injectable({ providedIn: 'root' })
export class EventAccessGuard implements CanActivate {

  constructor(
    private service: EventService,
    private invitationService: InvitationService,
    private authQuery: AuthQuery,
    private authStore: AuthStore,
    private authService: AuthService,
    private router: Router,
    private afAuth: AngularFireAuth,
    private snackBar: MatSnackBar
  ) { }

  canActivate(route: ActivatedRouteSnapshot) {
    // Listenning for authState changes
    this.listenOnCurrentUserState();

    return combineLatest([
      this.authService.user,
      this.service.getValue(route.params.eventId as string),
      this.authQuery.anonymousCredentials$
    ]).pipe(
      switchMap(async ([currentUser, event, anonymousCredentials]) => {
        if (!currentUser.isAnonymous) return true;
        switch (event.accessibility) {
          case 'public':
            // We just check that anonymous user have lastName and firstName
            return hasAnonymousIdentity(anonymousCredentials, event.accessibility) || this.router.navigate([`/event/${event.id}`]);
          case 'invitation-only': {
            // We check if invitation is for event and email is same as current
            if (route.queryParams?.i && !anonymousCredentials.invitationId) {
              this.authStore.updateAnonymousCredentials({ invitationId: route.queryParams?.i });
            }

            const invitationId = route.queryParams?.i as string || anonymousCredentials?.invitationId;
            if (invitationId) {
              const invitation = await this.invitationService.getValue(invitationId).catch(() => createInvitation());
              if (invitation?.toUser?.email === anonymousCredentials?.email && invitation?.eventId === event.id) {
                return hasVerifiedAnonymousIdentity(anonymousCredentials, event.accessibility) || this.router.navigate([`/event/${event.id}`]);
              } else {
                this.snackBar.open('Incorrect invitation for event', 'close', { duration: 5000 });
                this.router.navigate(['/']);
                return false;
              }
            } else {
              this.snackBar.open('Invitation not found', 'close', { duration: 5000 });
              this.router.navigate(['/']);
              return false;
            }
          }
          case 'private':
            this.snackBar.open('You need to log-in for this event', 'close', { duration: 5000 });
            this.router.navigate([`/event/${event.id}/r/login`]);
            return false;
        }
      }));
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

