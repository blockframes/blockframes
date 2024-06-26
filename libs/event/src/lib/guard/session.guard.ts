
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '@blockframes/auth/service';
import { EventService } from '../service';
import { Meeting } from '@blockframes/model';

@Injectable({ providedIn: 'root' })
export class SessionGuard {

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private router: Router,
  ) { }

  async canActivate(next: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
    const eventId: string = next.params.eventId;
    const event = await this.eventService.getValue(eventId);

    if (event.isOwner) return true;

    // for meeting event we also nee to check "Request Access"
    if (event.type === 'meeting') {
      const attendee = (event.meta as Meeting).attendees[this.authService.uid];

      if (attendee?.status === 'accepted' || attendee?.status === 'owner') return true;

      return this.router.parseUrl(`/event/${event.id}/r/i/lobby`);
    }

    return true;
  }
}
