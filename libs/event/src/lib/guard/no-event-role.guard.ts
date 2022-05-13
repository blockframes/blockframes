import { Injectable, NgZone } from "@angular/core";
import { EventService } from "../+state/event.service";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";
import { map } from "rxjs/operators";
import { AuthService } from "@blockframes/auth/+state";
import { combineLatest } from "rxjs";
import { runInZone } from "@blockframes/utils/zone";

@Injectable({ providedIn: 'root' })
export class NoEventRoleGuard implements CanActivate {

  constructor(
    private service: EventService,
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone,
  ) { }

  canActivate(next: ActivatedRouteSnapshot) {
    return combineLatest([
      this.authService._user$,
      this.authService.anonymousCredentials$,
      this.service.valueChanges(next.params.eventId as string).pipe(runInZone(this.ngZone)) // TODO #7595 #7273
    ]).pipe(
      map(([userAuth, creds, event]) => {
        if (userAuth && !userAuth.isAnonymous) return true;

        if (creds?.role === 'organizer') return this.router.createUrlTree([`/event/${event.id}/auth/login`], { queryParams: next.queryParams });

        const page = event.accessibility === 'protected' ? 'email' : 'identity';
        if (creds?.role === 'guest') return this.router.createUrlTree([`/event/${event.id}/auth/${page}`], { queryParams: next.queryParams });

        return true;
      })
    );
  }
}
