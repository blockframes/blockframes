import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";
import { map } from "rxjs/operators";
import { AuthService } from "@blockframes/auth/+state";
import { AngularFireAuth } from "@angular/fire/auth";
import { combineLatest } from "rxjs";

@Injectable({ providedIn: 'root' })
export class NoEventAuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private afAuth: AngularFireAuth,
    private router: Router,
  ) { }

  canActivate(next: ActivatedRouteSnapshot) {
    return combineLatest([
      this.afAuth.authState,
      this.authService.anonymousCredentials$,
    ]).pipe(
      map(([userAuth, creds]) => {
        if (!userAuth?.isAnonymous) {
          return this.router.createUrlTree([`/event/${next.params.eventId}/r/i`], { queryParams: next.queryParams });
        } else if (!creds?.role) {
          return this.router.createUrlTree([`/event/${next.params.eventId}/auth/role`], { queryParams: next.queryParams });
        }
        return true;
      })
    );
  }
}
