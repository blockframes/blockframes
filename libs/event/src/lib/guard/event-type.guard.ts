import { Injectable } from '@angular/core';
import { CanActivate, UrlTree, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventService } from '../+state';

@Injectable({ providedIn: 'root' })
export class EventTypeGuard implements CanActivate {

  constructor(
    private service: EventService,
    private router: Router,
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    const nextPage = state.url.split('/').pop();
    return this.service.valueChanges(route.params['eventId'] as string).pipe(
      // @TODO #5895 if event is ended => redirect to anaylitcs tab
      map(event => {
        if (nextPage === 'edit') {
          return this.router.parseUrl(`/c/o/dashboard/event/${event.id}/edit/${event.type}`)
        } else {
          return true;
        }
      })
    );
  }
}
