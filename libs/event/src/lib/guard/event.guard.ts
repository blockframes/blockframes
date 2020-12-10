import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { InvitationQuery, Invitation } from '@blockframes/invitation/+state';
import { Observable } from 'rxjs';
import { EventQuery } from '../+state';
import { eventTime } from '../pipes/event-time.pipe';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { AuthQuery } from '@blockframes/auth/+state';
import { Meeting } from '../+state/event.firestore';


@Injectable({ providedIn: 'root' })
export class EventGuard implements CanActivate, CanDeactivate<any> {

  constructor(
    private authQuery: AuthQuery,
    private invitationQuery: InvitationQuery,
    private eventQuery: EventQuery,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  async canActivate(next: ActivatedRouteSnapshot,): Promise<boolean | UrlTree> {
    const event = this.eventQuery.getActive();

    // if the event is not a meeting the lobby page is not accessible
    // redirect directly to the session page,
    // the guard will then be re-evaluated for invitation etc... on the session page
    if (event.type !== 'meeting' && next.routeConfig.path === 'lobby') {
      return this.router.parseUrl(`/c/o/marketplace/event/${event.id}/session`);
    }

    if (eventTime(event) !== 'onTime') {
      return this.router.parseUrl(`/c/o/marketplace/event/${event.id}`);
    }

    if (event.isOwner) {
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
      return this.router.parseUrl(`/c/o/marketplace/event/${event.id}`);
    }

    return true;
  }

  canDeactivate(
    component: any,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ): (boolean |Observable<boolean>) {

    // we don't show the confirm dialog if the user don't quit the event
    // i.e. if the user navigate  lobby <-> session
    const nextPage = nextState.url.split('/').pop();
    if (nextPage === 'session' || nextPage === 'lobby') {
      return true;
    }

    // If userId = null, that means the user has disconnected. If she/he wants to logout, we don't show the confirm message
    if(this.authQuery.userId === null) {
      return true;
    } else {
      const event = this.eventQuery.getActive();
      if (event.type === 'meeting') {
        if ((event.meta as Meeting).attendees[this.authQuery.userId] === 'ended') return true;
      }
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
}
