import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '@blockframes/auth/+state';
import { InvitationService } from '@blockframes/invitation/+state';
import { combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { EventService } from '../+state';
import type firebase from 'firebase';
import { Event } from '@blockframes/shared/model';
import { AnonymousCredentials } from '@blockframes/auth/+state/auth.model';
import { createInvitation } from '@blockframes/shared/model';

@Injectable({ providedIn: 'root' })
export class EventAccessGuard implements CanActivate {
  constructor(
    private service: EventService,
    private invitationService: InvitationService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  canActivate(next: ActivatedRouteSnapshot) {
    return combineLatest([
      this.authService.user,
      this.service.getValue(next.params.eventId as string),
      this.authService.anonymousCredentials$,
    ]).pipe(switchMap(([user, event, credentials]) => this.guard(next, user, event, credentials)));
  }

  private async guard(
    next: ActivatedRouteSnapshot,
    user: firebase.User,
    event: Event<unknown>,
    credentials: AnonymousCredentials
  ) {
    if (!user.isAnonymous) return true;
    switch (event.accessibility) {
      case 'protected': {
        const credentialsUpdateNeeded = !credentials.invitationId || credentials.invitationId !== next.queryParams?.i;
        if (next.queryParams?.i && credentialsUpdateNeeded) {
          this.authService.updateAnonymousCredentials({ invitationId: next.queryParams?.i });
        }

        const invitationId = (next.queryParams?.i as string) || credentials?.invitationId;
        if (invitationId) {
          const invitation = await this.invitationService.getValue(invitationId).catch(() => createInvitation());
          const isEmailMatchingInvitation = invitation?.toUser?.email === credentials?.email;
          if (!isEmailMatchingInvitation) {
            this.snackBar.open('Provided email does not match invitation', 'close', { duration: 5000 });
            this.authService.updateAnonymousCredentials({ email: undefined });
            this.router.navigate([`/event/${event.id}`], { queryParams: next.queryParams });
            return false;
          }

          const isInvitationMatchingEvent = invitation?.eventId === event.id;
          if (!isInvitationMatchingEvent) {
            this.snackBar.open('Incorrect invitation for event', 'close', { duration: 5000 });
            await this.authService.deleteAnonymousUser();
            return false;
          }

          return true;
        } else {
          this.snackBar
            .open('Sorry, it seems that you were not invited to this event', 'Try with other mail', { duration: 6000 })
            .onAction()
            .subscribe(() => this.router.navigate([`/event/${event.id}`]));
          await this.authService.deleteAnonymousUser();
          return false;
        }
      }
      default:
        return true;
    }
  }
}
