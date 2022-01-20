import { Injectable } from '@angular/core';
import { CanActivate, UrlTree, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventService } from '../+state';

@Injectable({ providedIn: 'root' })
export class EventTypeGuard implements CanActivate {

  constructor(
    private service: EventService,
    private router: Router,
  ) { }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const eventId: string = route.params['eventId'];
    if (eventId === 'new') return of(true);
    return this.service.valueChanges(eventId).pipe(
      map(event => {
        const path = event.end < new Date() && event.type !== 'meeting' ? 'statistics' : event.type;
        return this.router.parseUrl(`/c/o/dashboard/event/${event.id}/edit/${path}`)
      })
    );
  }
}
