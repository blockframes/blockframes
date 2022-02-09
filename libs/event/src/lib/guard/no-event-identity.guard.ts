import { Injectable } from "@angular/core";
import { EventService } from "../+state/event.service";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { map } from "rxjs/operators";
import { AuthService } from "@blockframes/auth/+state";
import { combineLatest } from "rxjs";
import { hasAnonymousIdentity } from "@blockframes/auth/+state/auth.model";

@Injectable({ providedIn: 'root' })
export class NoEventIdentityGuard implements CanActivate {

  constructor(
    private service: EventService,
    private authService: AuthService,
    private router: Router,
  ) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentPage = state.url.split('/').pop().split('?')[0];
    return combineLatest([
      this.authService.user$,
      this.authService.anonymousCredentials$,
      this.service.valueChanges(next.params.eventId as string)
    ]).pipe(
      map(([userAuth, creds, event]) => {
        if (userAuth && !userAuth.isAnonymous) return true;

        const eventId = event.id;
        const queryParams = next.queryParams;

        if (!creds?.role) return this.router.createUrlTree([`/event/${eventId}/auth/role`], { queryParams });

        if (creds.role === 'organizer') return this.router.createUrlTree([`/event/${eventId}/auth/login`], { queryParams });

        if (hasAnonymousIdentity(creds, event.accessibility)) return this.router.createUrlTree([`/event/${eventId}/r/i`], { queryParams });

        if (event.accessibility === 'protected' && currentPage !== 'email') return this.router.createUrlTree([`/event/${eventId}/auth/email`], { queryParams });

        if (event.accessibility === 'public' && currentPage !== 'identity') return this.router.createUrlTree([`/event/${eventId}/auth/identity`], { queryParams });

        if (event.accessibility === 'private') return this.router.createUrlTree([`/event/${eventId}/auth/login`], { queryParams });

        return false;
      })
    );
  }
}
