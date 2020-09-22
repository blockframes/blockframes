import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { InvitationQuery, Invitation } from '@blockframes/invitation/+state';
import { EventService, EventQuery } from '../+state';
import { eventTime } from '../pipes/event-time.pipe';

@Injectable({ providedIn: 'root' })
export class SessionGuard implements CanActivate {
  constructor(
    private invitationQuery: InvitationQuery,
    private eventQuery: EventQuery,
    private service: EventService,
    private router: Router
  ) {}

  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    const eventId: string = next.params.eventId;
    const hasUserAccepted = this.invitationQuery.hasEntity((invitation: Invitation) => {
      return invitation.docId === eventId && invitation.status === 'accepted';
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
}
