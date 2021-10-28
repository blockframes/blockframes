import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { InvitationQuery, Invitation, InvitationService } from '@blockframes/invitation/+state';
import { Observable } from 'rxjs';
import { EventQuery } from '../+state';
import { eventTime } from '../pipes/event-time.pipe';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { AuthQuery } from '@blockframes/auth/+state';
import { Meeting } from '../+state/event.firestore';
import { TwilioService } from '../components/meeting/+state/twilio.service';


@Injectable({ providedIn: 'root' })
export class EventGuard implements CanActivate, CanDeactivate<unknown> {

  constructor(
    private authQuery: AuthQuery,
    private invitationQuery: InvitationQuery,
    private invitationService: InvitationService,
    private eventQuery: EventQuery,
    private router: Router,
    private dialog: MatDialog,
    private twilioService: TwilioService,
  ) { }

  async canActivate(next: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
    const event = this.eventQuery.getActive();

    // if the event is not a meeting the lobby page is not accessible
    // redirect directly to the session page,
    // the guard will then be re-evaluated for invitation etc... on the session page
    if (event.type !== 'meeting' && next.routeConfig.path === 'lobby') {
      return this.router.parseUrl(`/event/${event.id}/r/i/session`);
    }

    if (eventTime(event) !== 'onTime') {
      return this.router.parseUrl(`/event/${event.id}/r/i`);
    }

    switch (event.accessibility) {
      case 'public':
        return true;
      case 'invitation-only': {

        if (event.isOwner) {
          return true;
        }

        const hasRealAccountInvitation = this.invitationQuery.hasEntity((invitation: Invitation) => {
          return (
            invitation.eventId === event.id &&
            invitation.status === 'accepted' && (
              invitation.mode === 'request' && invitation.fromUser.uid === this.authQuery.userId ||
              invitation.mode === 'invitation' && invitation.toUser.uid === this.authQuery.userId
            )
          );
        });

        let hasAnonymousInvitation = false;
        const anonymousCreds = this.authQuery.anonymousCredentials;
        const invitationId = anonymousCreds?.invitationId;
        if (invitationId && event.accessibility === 'invitation-only') {
          const invitation = await this.invitationService.getValue(invitationId);
          hasAnonymousInvitation = invitation?.toUser?.email === anonymousCreds.email &&
            event.id === invitation?.eventId &&
            invitation.status === 'accepted' &&
            invitation.accessAllowed;
        }

        // if user wasn't invited OR hasn't accepted yet
        if (!hasRealAccountInvitation && !hasAnonymousInvitation) {
          return this.router.parseUrl(`/event/${event.id}/r/i`);
        }

        return true;
      }
      case 'private': {

        if (event.isOwner) {
          return true;
        }
        const hasUserAccepted = this.invitationQuery.hasEntity((invitation: Invitation) => {
          return (
            invitation.eventId === event.id &&
            invitation.status === 'accepted' && (
              invitation.mode === 'request' && invitation.fromUser.uid === this.authQuery.userId ||
              invitation.mode === 'invitation' && invitation.toUser.uid === this.authQuery.userId
            )
          );
        });

        // if user wasn't invited OR hasn't accepted yet
        if (!hasUserAccepted) {
          return this.router.parseUrl(`/event/${event.id}/r/i`);
        }

        return true;
      }

    }

  }

  canDeactivate(
    component: unknown,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ): (boolean | Observable<boolean>) {

    // we don't show the confirm dialog if the user don't quit the event
    // i.e. if the user navigate  lobby <-> session
    const nextPage = nextState.url.split('/').pop();
    if (nextPage === 'session' || nextPage === 'lobby') {
      this.twilioService.disconnect();
      return true;
    }

    // If userId = null, that means the user has disconnected. If she/he wants to logout, we don't show the confirm message
    if (this.authQuery.userId === null) {
      this.twilioService.disconnect();
      return true;
    } else {
      const event = this.eventQuery.getActive();
      if (event.type === 'meeting') {
        if ((event.meta as Meeting).attendees[this.authQuery.userId]?.status === 'ended') {
          this.twilioService.disconnect();
          return true;
        }
      }
      const dialogRef = this.dialog.open(ConfirmComponent, {
        data: {
          title: `You are about to leave this ${event.type}.`,
          question: `You might not be able to come back as its access is time-limited.`,
          confirm: 'Leave anyway',
          cancel: 'Stay',
        },
        autoFocus: false,
      })
      return dialogRef.afterClosed();
    }

  }
}
