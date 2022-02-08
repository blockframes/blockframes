import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { InvitationService } from '@blockframes/invitation/+state';
import { Observable } from 'rxjs';
import { Event, EventService } from '../+state';
import { eventTime } from '../pipes/event-time.pipe';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { AuthService } from '@blockframes/auth/+state';
import { Meeting } from '../+state/event.firestore';
import { TwilioService } from '../components/meeting/+state/twilio.service';
import { take } from 'rxjs/operators';


@Injectable({ providedIn: 'root' })
export class EventGuard implements CanActivate, CanDeactivate<unknown> {

  private event: Event;

  constructor(
    private authService: AuthService,
    private invitationService: InvitationService,
    private eventService: EventService,
    private router: Router,
    private dialog: MatDialog,
    private twilioService: TwilioService,
  ) { }

  async canActivate(next: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
    const eventId: string = next.params.eventId;
    this.event = await this.eventService.getValue(eventId);

    // if the event is not a meeting the lobby page is not accessible
    // redirect directly to the session page,
    // the guard will then be re-evaluated for invitation etc... on the session page
    if (this.event.type !== 'meeting' && next.routeConfig.path === 'lobby') {
      return this.router.parseUrl(`/event/${this.event.id}/r/i/session`);
    }

    if (eventTime(this.event) !== 'onTime') {
      return this.router.parseUrl(`/event/${this.event.id}/r/i`);
    }

    const hasRegularInvitation = async () => {
      const allInvitations = await this.invitationService.allInvitations$.pipe(take(1)).toPromise();
      return allInvitations.some(invitation => {
        if (invitation.eventId !== this.event.id) return false;
        if (invitation.status !== 'accepted') return false;
        const hasRequested = invitation.mode === 'request' && invitation.fromUser.uid === this.authService.profile.uid;
        const isInvited = invitation.mode === 'invitation' && invitation.toUser.uid === this.authService.profile.uid;
        return hasRequested || isInvited;
      });
    }

    switch (this.event.accessibility) {
      case 'public':
        return true;
      case 'protected': {

        if (this.event.isOwner) return true;

        const hasAnonymousInvitation = async () => {
          const anonymousCreds = this.authService.anonymousCredentials;
          const invitationId = anonymousCreds?.invitationId;
          if (!invitationId) return false;
          const invitation = await this.invitationService.getValue(invitationId);
          if (invitation?.eventId !== this.event.id) return false;
          if (invitation?.status !== 'accepted') return false;
          if (invitation?.toUser?.email !== anonymousCreds.email) return false;
          return true;
        }

        // if user wasn't invited OR hasn't accepted yet
        if (!(await hasRegularInvitation()) && !(await hasAnonymousInvitation())) {
          return this.router.parseUrl(`/event/${this.event.id}/r/i`);
        }

        return true;
      }
      case 'private': {

        if (this.event.isOwner) {
          return true;
        }

        // if user wasn't invited OR hasn't accepted yet
        if (!(await hasRegularInvitation())) {
          return this.router.parseUrl(`/event/${this.event.id}/r/i`);
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
    if (this.authService.profile.uid === null && this.authService.anonymousUserId === null) {
      this.twilioService.disconnect();
      return true;
    } else {
      if (this.event.type === 'meeting') {
        if ((this.event.meta as Meeting).attendees[this.authService.profile.uid || this.authService.anonymousUserId]?.status === 'ended') {
          this.twilioService.disconnect();
          return true;
        }
      }
      const dialogRef = this.dialog.open(ConfirmComponent, {
        data: {
          title: `You are about to leave this ${this.event.type}.`,
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
