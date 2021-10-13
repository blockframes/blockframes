import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CanActivate, Router } from '@angular/router';
import { AuthQuery, AuthService, AuthStore } from '@blockframes/auth/+state';
import { switchMap } from 'rxjs/operators';
import { EventQuery } from '../+state';

@Injectable({ providedIn: 'root' })
export class EventRoleGuard implements CanActivate {

  constructor(
    private authStore: AuthStore,
    private authQuery: AuthQuery,
    private router: Router,
    private eventQuery: EventQuery,
    private afAuth: AngularFireAuth,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  canActivate() {
    const anonymousCredentials = this.authQuery.anonymousCredentials;

    const event = this.eventQuery.getActive();
    if (!anonymousCredentials?.role) {
      return this.router.navigate([`/events/${event.id}`]);
    }

    // If user choosen "organizer", he needs to login
    if (anonymousCredentials?.role === 'organizer') {
      return this.afAuth.authState.pipe(
        switchMap(async userAuth => {
          if (!userAuth) {
            return this.router.navigate([`/events/${this.eventQuery.getActiveId()}/login`]);
          }

          if (userAuth.isAnonymous) {
            await this.authService.deleteAnonymousUser();
            return this.router.navigate([`/events/${this.eventQuery.getActiveId()}/login`]);
          }

          // If current logged in user is not owner, redirect to choose your role
          if (event.isOwner) {
            return true;
          } else {
            this.snackBar.open('You must be logged in as owner of the event', 'close', { duration: 5000 });
            this.authStore.update({ role: undefined });
            return this.router.navigate([`/events/${this.eventQuery.getActiveId()}/login`]);
          }
        }))
    }

    return true;
  }

}
