import { Injectable } from '@angular/core';
import { CanActivate, UrlTree, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventService } from '../+state';

@Injectable({ providedIn: 'root' })
export class EventTypeGuard implements CanActivate {

  constructor(
    private service: EventService,
    private router: Router,
  ) { }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    return this.service.valueChanges(route.params['eventId'] as string).pipe(
      map(event => {
        const path = event.start < new Date() ? 'statistics' : event.type;
        return this.router.parseUrl(`/c/o/dashboard/event/${event.id}/edit/${path}`)
      })
    );
  }
}
