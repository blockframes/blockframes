import { Injectable } from '@angular/core';
import { Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { InvitationService } from '@blockframes/invitation/service';
import { firstValueFrom, Observable } from 'rxjs';
import { EventService } from '../service';
import { eventTime } from '../pipes/event-time.pipe';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { AuthService } from '@blockframes/auth/service';
import { Event, Meeting } from '@blockframes/model';
import { TwilioService } from '@blockframes/utils/twilio';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';


@Injectable({ providedIn: 'root' })
export class EventGuard {

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
    if (this.event.type !== 'meeting' && next.routeConfig.path === 'lobby') return this.router.parseUrl(`/event/${this.event.id}/r/i/session`);

    if (eventTime(this.event) !== 'onTime') return this.router.parseUrl(`/event/${this.event.id}/r/i`);

    const hasRegularInvitation = async () => {
      const allInvitations = await firstValueFrom(this.invitationService.allInvitations$);
      return allInvitations.some(invitation => {
        if (invitation.eventId !== this.event.id) return false;
        if (invitation.status !== 'accepted') return false;
        const hasRequested = invitation.mode === 'request' && invitation.fromUser.uid === this.authService.uid;
        const isInvited = invitation.mode === 'invitation' && invitation.toUser.uid === this.authService.uid;
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

        if (this.event.isOwner) return true;

        // if user wasn't invited OR hasn't accepted yet
        if (!(await hasRegularInvitation())) return this.router.parseUrl(`/event/${this.event.id}/r/i`);

        return true;
      }

    }

  }

  canDeactivate(
    _: unknown,
    __: ActivatedRouteSnapshot,
    ___: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ): (boolean | Observable<boolean>) {

    // we don't show the confirm dialog if the user don't quit the event
    // i.e. if the user navigate  lobby <-> session
    const nextPage = nextState.url.split('/').pop();
    if (nextPage === 'session' || nextPage === 'lobby') {
      this.twilioService.disconnect();
      return true;
    }

    // If userId is undefined, that means the user has disconnected. If she/he wants to logout, we don't show the confirm message
    if (this.authService.uid === undefined) {
      this.twilioService.disconnect();
      return true;
    } else {
      if (this.event.type === 'meeting') {
        if ((this.event.meta as Meeting).attendees[this.authService.uid]?.status === 'ended') {
          this.twilioService.disconnect();
          return true;
        }
      }

      const navObject = this.router.getCurrentNavigation();
      if (navObject.extras?.state?.eventDeleted) return true;

      const dialogRef = this.dialog.open(ConfirmComponent, {
        data: createModalData({
          title: `You are about to leave this ${this.event.type}.`,
          question: `You might not be able to come back as the access to the ${this.event.type} is time-limited.`,
          confirm: 'Leave anyway',
          cancel: 'Stay'
        }),
        autoFocus: false
      });
      return dialogRef.afterClosed();
    }

  }
}
