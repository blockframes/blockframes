import { Injectable } from "@angular/core";
import { EventService } from "../+state/event.service";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";
import { map } from "rxjs/operators";
import { AuthService } from "@blockframes/auth/+state";
import { combineLatest } from "rxjs";

@Injectable({ providedIn: 'root' })
export class NoEventRoleGuard implements CanActivate {

  constructor(
    private service: EventService,
    private authService: AuthService,
    private router: Router,
  ) { }

  canActivate(next: ActivatedRouteSnapshot) {
    return combineLatest([
      this.authService.authState$,
      this.authService.anonymousCredentials$,
      this.service.valueChanges(next.params.eventId as string)
    ]).pipe(
      map(([userAuth, creds, event]) => {
        if (userAuth?.isAnonymous) {
          if (creds?.role === 'organizer') {
            return this.router.createUrlTree([`/event/${event.id}/auth/login`], { queryParams: next.queryParams });
          } else if (creds?.role === 'guest') {
            const page = event.accessibility === 'protected' ? 'email' : 'identity';
            return this.router.createUrlTree([`/event/${event.id}/auth/${page}`], { queryParams: next.queryParams });
          }
        }

        return true;
      })
    );
  }
}
