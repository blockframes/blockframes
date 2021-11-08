import { Injectable } from "@angular/core";
import { EventService } from "../+state/event.service";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";
import { map } from "rxjs/operators";
import { AuthService } from "@blockframes/auth/+state";
import { AngularFireAuth } from "@angular/fire/auth";
import { combineLatest } from "rxjs";
import { hasAnonymousIdentity } from "@blockframes/auth/+state/auth.model";

@Injectable({ providedIn: 'root' })
export class IdentityGuard implements CanActivate {

  constructor(
    private service: EventService,
    private authService: AuthService,
    private afAuth: AngularFireAuth,
    private router: Router,
  ) { }

  canActivate(next: ActivatedRouteSnapshot) {
    return combineLatest([
      this.afAuth.authState,
      this.authService.anonymousCredentials$,
      this.service.valueChanges(next.params.eventId as string)
    ]).pipe(
      map(([userAuth, creds, event]) => {
        if (userAuth?.isAnonymous) {
          if (!creds?.role) {
            return this.router.createUrlTree([`/event/${event.id}/auth/role`], { queryParams: next.queryParams });
          } else if (creds?.role === 'organizer' || event.accessibility === 'private') {
            return this.router.createUrlTree([`/event/${event.id}/auth/login`], { queryParams: next.queryParams });
          } else if (creds?.role && !hasAnonymousIdentity(creds, event.accessibility)) {
            const page = event.accessibility === 'invitation-only' ? 'email' : 'identity';
            return this.router.createUrlTree([`/event/${event.id}/auth/${page}`], { queryParams: next.queryParams });
          }
        }

        return true;
      })
    );
  }
}
