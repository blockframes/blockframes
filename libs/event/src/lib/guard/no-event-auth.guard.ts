import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";
import { map } from "rxjs/operators";
import { AuthService } from "@blockframes/auth/+state";
import { combineLatest } from "rxjs";

@Injectable({ providedIn: 'root' })
export class NoEventAuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  canActivate(next: ActivatedRouteSnapshot) {
    return combineLatest([
      this.authService.user$,
      this.authService.anonymousCredentials$,
    ]).pipe(
      map(([userAuth, creds]) => {
        const eventId = next.params.eventId;
        const queryParams = next.queryParams;

        if (!userAuth?.isAnonymous) return this.router.createUrlTree([`/event/${eventId}/r/i`], { queryParams });

        if (!creds?.role) return this.router.createUrlTree([`/event/${eventId}/auth/role`], { queryParams });

        return true;
      })
    );
  }
}
