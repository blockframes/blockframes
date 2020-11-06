import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree, CanDeactivate } from '@angular/router';
import { InvitationQuery, Invitation } from '@blockframes/invitation/+state';
import { Observable } from 'rxjs';
import { EventService, EventQuery } from '../+state';
import { eventTime } from '../pipes/event-time.pipe';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';


@Injectable({ providedIn: 'root' })
export class SessionGuard implements CanActivate, CanDeactivate<any> {

  constructor(
    private invitationQuery: InvitationQuery,
    private eventQuery: EventQuery,
    private service: EventService,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    const eventId: string = next.params.eventId;
    const hasUserAccepted = this.invitationQuery.hasEntity((invitation: Invitation) => {
      return invitation.docId === eventId && (invitation.status === 'accepted' || invitation.status === 'attended' );
    });
    const { isOwner } = this.eventQuery.getActive();
    if (!isOwner && !hasUserAccepted) {
      return this.router.parseUrl(`/c/o/marketplace/event/${eventId}`);
    }
    const event = await this.service.getValue(eventId);
    if (eventTime(event) !== 'onTime') {
      return this.router.parseUrl(`/c/o/marketplace/event/${eventId}`);
    }
    return true;
  }

  canDeactivate(): Observable<boolean> {
    const event = this.eventQuery.getActive();
    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: {
        title: 'Are you sure ?',
        question: `You might not be able to come back to this ${event.type} as its access is time-limited.`,
        buttomName: 'Yes',
      }
    })
    return dialogRef.afterClosed();
  }
}
