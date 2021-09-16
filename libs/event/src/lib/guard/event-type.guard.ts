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
      // @TODO #5895 if event is started or ended => redirect to anaylitcs tab Antoine
      map(event => this.router.parseUrl(`/c/o/dashboard/event/${event.id}/edit/${event.type}`))
    );
  }
}
