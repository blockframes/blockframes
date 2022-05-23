import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '@blockframes/auth/+state';
import { InvitationService } from '@blockframes/invitation/+state';
import { combineLatest, firstValueFrom } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { EventService } from '../+state';
import { User } from 'firebase/auth';
import { Event, AnonymousCredentials, createInvitation, hasDisplayName } from '@blockframes/model';
import { OrganizationService } from '@blockframes/organization/+state';

@Injectable({ providedIn: 'root' })
export class EventAccessGuard implements CanActivate {

  constructor(
    private service: EventService,
    private invitationService: InvitationService,
    private orgService: OrganizationService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  canActivate(next: ActivatedRouteSnapshot) {
    return combineLatest([
      this.authService._user$,
      this.service.getValue(next.params.eventId as string),
      this.authService.anonymousCredentials$
    ]).pipe(
      switchMap(([user, event, credentials]) => this.guard(next, user, event, credentials))
    );
  }

  private async guard(next: ActivatedRouteSnapshot, user: User, event: Event<unknown>, credentials: AnonymousCredentials) {
    if (!user.isAnonymous) {
      const profile = await firstValueFrom(this.authService.profile$);
      const validUser = hasDisplayName(profile) && user.emailVerified && profile.orgId;
      if (!validUser) return this.router.createUrlTree(['/auth/identity']);

      const org = await firstValueFrom(this.orgService.currentOrg$);
      if (org.status !== 'accepted') return this.router.createUrlTree(['/c/organization/create-congratulations']);

      return true;
    };

    switch (event.accessibility) {
      case 'protected': {
        const credentialsUpdateNeeded = !credentials.invitationId || credentials.invitationId !== next.queryParams?.i;
        if (next.queryParams?.i && credentialsUpdateNeeded) {
          this.authService.updateAnonymousCredentials({ invitationId: next.queryParams?.i });
        }
        const incorrectInvitation = 'Sorry, it seems that you were not invited to this event. Check your emails';
        const invitationId = next.queryParams?.i as string || credentials?.invitationId;
        if (invitationId) {
          const invitation = await this.invitationService.getValue(invitationId).catch(() => createInvitation());
          const isEmailMatchingInvitation = invitation?.toUser?.email === credentials?.email;

          const isInvitationMatchingEvent = invitation?.eventId === event.id;
          if (!isInvitationMatchingEvent) {
            this.snackBar.open(incorrectInvitation, 'close', { duration: 12000 });
            await this.authService.deleteAnonymousUser();
            return false;
          }

          if (!isEmailMatchingInvitation) {
            this.snackBar.open('Sorry, it seems that you were not invited to this event. Try with other mail', 'close', { duration: 12000 });
            this.authService.updateAnonymousCredentials({ email: undefined });
            this.router.navigate([`/event/${event.id}`], { queryParams: next.queryParams });
            return false;
          }

          return true;
        } else {
          this.snackBar.open(incorrectInvitation, 'close', { duration: 12000 });
          await this.authService.deleteAnonymousUser();
          return false;
        }
      }
      default:
        return true;
    }
  }
}

