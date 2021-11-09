import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '@blockframes/auth/+state';
import { createInvitation, InvitationService } from '@blockframes/invitation/+state';
import { combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { EventService } from '../+state';

@Injectable({ providedIn: 'root' })
export class EventAccessGuard implements CanActivate {

  constructor(
    private service: EventService,
    private invitationService: InvitationService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  canActivate(route: ActivatedRouteSnapshot) {
    return combineLatest([
      this.authService.user,
      this.service.getValue(route.params.eventId as string),
      this.authService.anonymousCredentials$
    ]).pipe(
      switchMap(async ([currentUser, event, anonymousCredentials]) => {
        if (!currentUser.isAnonymous) return true;
        switch (event.accessibility) {
          case 'invitation-only': {
            const credentialsUpdateNeeded = !anonymousCredentials.invitationId || anonymousCredentials.invitationId !== route.queryParams?.i;
            if (route.queryParams?.i && credentialsUpdateNeeded) {
              this.authService.updateAnonymousCredentials({ invitationId: route.queryParams?.i });
            }

            const invitationId = route.queryParams?.i as string || anonymousCredentials?.invitationId;
            if (invitationId) {
              const invitation = await this.invitationService.getValue(invitationId).catch(() => createInvitation());
              const isEmailMatchingInvitation = invitation?.toUser?.email === anonymousCredentials?.email;
              if (!isEmailMatchingInvitation) {
                this.snackBar.open('Provided email does not match invitation', 'close', { duration: 5000 });
                this.authService.updateAnonymousCredentials({ email: undefined });
                this.router.navigate([`/event/${event.id}`], { queryParams: route.queryParams });
                return false;
              }

              const isInvitationMatchingEvent = invitation?.eventId === event.id;
              if (!isInvitationMatchingEvent) {
                this.snackBar.open('Incorrect invitation for event', 'close', { duration: 5000 });
                await this.authService.signOut();
                return false;
              }

              return true;
            } else {
              this.snackBar.open('Missing invitation parameter', 'close', { duration: 5000 });
              await this.authService.signOut();
              return false;
            }
          }
          default:
            return true;
        }
      }));
  }
}

