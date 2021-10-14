import { Injectable } from "@angular/core";
import { CollectionGuard, CollectionGuardConfig } from "akita-ng-fire";
import { EventState } from "../+state/event.store";
import { EventService } from "../+state/event.service";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { map } from "rxjs/operators";
import { AuthQuery } from "@blockframes/auth/+state";
import { AngularFireAuth } from "@angular/fire/auth";

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class EventRoleGuard extends CollectionGuard<EventState> {

  constructor(
    service: EventService,
    private authQuery: AuthQuery,
    private afAuth: AngularFireAuth,
  ) {
    super(service);
  }

  // Sync and set active
  sync(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const eventId = next.params.eventId;
    const currentPage = state.url.split('/').pop();
    return this.afAuth.authState.pipe(
      map(async userAuth => {
        if (userAuth && userAuth.isAnonymous) {
          const anonymousCredentials = this.authQuery.anonymousCredentials;

          if (!anonymousCredentials?.role) {
            return this.router.navigate([`/events/${eventId}`]);
          }

          // If user choosen "organizer", he needs to login
          if (anonymousCredentials?.role === 'organizer' && currentPage !== 'login') {
            return this.router.navigate([`/events/${eventId}/r/login`]);
          }

          return true;
        } else {
          return true;
        }
      })
    );
  }
}
