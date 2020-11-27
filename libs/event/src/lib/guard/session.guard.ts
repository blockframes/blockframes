import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree, CanDeactivate } from '@angular/router';
import { InvitationQuery, Invitation } from '@blockframes/invitation/+state';
import { Observable } from 'rxjs';
import { EventQuery } from '../+state';
import { eventTime } from '../pipes/event-time.pipe';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { AuthQuery } from '@blockframes/auth/+state';


@Injectable({ providedIn: 'root' })
export class SessionGuard implements CanActivate, CanDeactivate<any> {

  constructor(
    private authQuery: AuthQuery,
    private invitationQuery: InvitationQuery,
    private eventQuery: EventQuery,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  async canActivate(): Promise<boolean | UrlTree> {
    const event = this.eventQuery.getActive();

    if (eventTime(event) !== 'onTime') {
      console.log('the event has not started or is already over') // TODO REMOVE DEBUG LOG
      return this.router.parseUrl(`/c/o/marketplace/event/${event.id}`);
    }
    console.log('event is on time') // TODO REMOVE DEBUG LOG

    if (event.isOwner) {
      console.log('You are the event owner, so it\'s ok') // TODO REMOVE DEBUG LOG
      return true;
    }
    const hasUserAccepted = this.invitationQuery.hasEntity((invitation: Invitation) => {
      return (
        invitation.docId === event.id &&
        invitation.status === 'accepted' && (
          invitation.mode === 'request' && invitation.fromUser.uid === this.authQuery.userId ||
          invitation.mode === 'invitation' && invitation.toUser.uid === this.authQuery.userId
        )
      );
    });

    // if user wasn't invited OR hasn't accepted yet
    if (!hasUserAccepted) {
      console.log('Not invited, or invitation not accepted') // TODO REMOVE DEBUG LOG
      return this.router.parseUrl(`/c/o/marketplace/event/${event.id}`);
    }

    console.log('invitation ok') // TODO REMOVE DEBUG LOG

    // for meeting event we also nee to check "Request Access"
    if (event.type === 'meeting') {
      // const status = event.meta.attendees[this.authQuery.userId];
      const status: (undefined | 'accepted' | 'denied' | 'owner') = 'accepted';

      if (status === 'accepted' || status === 'owner') {
        console.log('MEETING : access granted by owner') // TODO REMOVE DEBUG LOG
        return true;
      }
      console.log('MEETING : not even asked access to owner, or access has been denied') // TODO REMOVE DEBUG LOG
      return this.router.parseUrl(`/c/o/marketplace/event/${event.id}/lobby`);
    }

    console.log('Not a meeting and user is invited so... it\'s ok') // TODO REMOVE DEBUG LOG
    return true;
  }

  canDeactivate(): Observable<boolean> {
    const event = this.eventQuery.getActive();
    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: {
        title: 'Are you sure ?',
        question: `You might not be able to come back to this ${event.type} as its access is time-limited.`,
        buttonName: 'Yes',
      }
    })
    return dialogRef.afterClosed();
  }
}
