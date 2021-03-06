
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

import { AuthQuery } from '@blockframes/auth/+state';

import { EventQuery } from '../+state';
import { Meeting } from '../+state/event.firestore';


@Injectable({ providedIn: 'root' })
export class SessionGuard implements CanActivate {

  constructor(
    private authQuery: AuthQuery,
    private eventQuery: EventQuery,
    private router: Router,
  ) {}

  async canActivate(): Promise<boolean | UrlTree> {
    const event = this.eventQuery.getActive();

    if (event.isOwner) {
      return true;
    }

    // for meeting event we also nee to check "Request Access"
    if (event.type === 'meeting') {
      const status = (event.meta as Meeting).attendees[this.authQuery.userId];

      if (status === 'accepted' || status === 'owner') {
        return true;
      }
      return this.router.parseUrl(`/c/o/marketplace/event/${event.id}/lobby`);
    }

    return true;
  }
}
