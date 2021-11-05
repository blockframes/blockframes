import { Injectable } from "@angular/core";
import { EventService } from "../+state/event.service";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { map } from "rxjs/operators";
import { AuthService } from "@blockframes/auth/+state";
import { AngularFireAuth } from "@angular/fire/auth";
import { combineLatest } from "rxjs";
import { hasAnonymousIdentity } from "@blockframes/auth/+state/auth.model";

@Injectable({ providedIn: 'root' })
export class EventRoleGuard implements CanActivate {

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
          if (!creds?.role && currentPage !== 'role') {
            return this.router.createUrlTree([`/event/${event.id}/r/role`], { queryParams: next.queryParams });
          } else if (creds?.role === 'organizer' && currentPage !== 'login') { // If user choosen "organizer", he needs to login
            return this.router.createUrlTree([`/event/${event.id}/r/login`], { queryParams: next.queryParams });
          } else if (creds?.role && !hasAnonymousIdentity(creds, event.accessibility) && !['email', 'identity', 'login'].includes(currentPage)) {
            const page = event.accessibility === 'invitation-only' ? 'email' : 'identity';
            return this.router.createUrlTree([`/event/${event.id}/r/${page}`], { queryParams: next.queryParams });
          }
        }

        return true;
      })
    );
  }
}
