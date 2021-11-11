import { Injectable } from "@angular/core";
import { EventService } from "../+state/event.service";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { map } from "rxjs/operators";
import { AuthService } from "@blockframes/auth/+state";
import { AngularFireAuth } from "@angular/fire/auth";
import { combineLatest } from "rxjs";
import { hasAnonymousIdentity } from "@blockframes/auth/+state/auth.model";

@Injectable({ providedIn: 'root' })
export class NoEventIdentityGuard implements CanActivate {

  constructor(
    private service: EventService,
    private authService: AuthService,
    private afAuth: AngularFireAuth,
    private router: Router,
  ) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentPage = state.url.split('/').pop().split('?')[0];
    return combineLatest([
      this.afAuth.authState,
      this.authService.anonymousCredentials$,
      this.service.valueChanges(next.params.eventId as string)
    ]).pipe(
      map(([userAuth, creds, event]) => {
        if (userAuth?.isAnonymous) {

          const eventId = event.id;
          const queryParams = next.queryParams;

          if (!creds?.role) {
            return this.router.createUrlTree([`/event/${eventId}/auth/role`], { queryParams });
          } else if (creds.role === 'organizer') { // If user choosen "organizer", he needs to login
            return this.router.createUrlTree([`/event/${eventId}/auth/login`], { queryParams });
          } else if (hasAnonymousIdentity(creds, event.accessibility)) {
            return this.router.createUrlTree([`/event/${eventId}/r/i`], { queryParams });
          } else if (event.accessibility === 'protected' && currentPage !== 'email') {
            return this.router.createUrlTree([`/event/${eventId}/auth/email`], { queryParams });
          } else if (event.accessibility === 'public' && currentPage !== 'identity') {
            return this.router.createUrlTree([`/event/${eventId}/auth/identity`], { queryParams });
          } else if (event.accessibility === 'private') {
            return this.router.createUrlTree([`/event/${eventId}/auth/login`], { queryParams });
          }

        }

        return true;
      })
    );
  }
}
