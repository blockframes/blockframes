import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '@blockframes/auth/+state';
import { OrganizationService, OrganizationStore } from '@blockframes/organization/+state';
import { UserService } from '@blockframes/user/+state';
import { AccessibilityTypes } from '@blockframes/utils/static-model';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { EventService, EventState, EventStore } from '../+state';

@Injectable({ providedIn: 'root' })
export class EventAccessGuard implements CanActivate {

  constructor(
    private service: EventService,
    private eventStore: EventStore,
    private authService: AuthService,
    private userService: UserService,
    private orgService: OrganizationService,
    private router: Router,
    private afAuth: AngularFireAuth,
    private orgStore: OrganizationStore,
  ) { }

  canActivate(route: ActivatedRouteSnapshot) {
    /**
     * In order to fetch the required data for the event, user needs to be connected with a
     * regular account (password) (or with an anonymous account will be created if not).
     */
    return this.afAuth.authState.pipe(
      switchMap(async userAuth => {
        /**
         * If current user is not anonymous, we populate org stage
         */
        if (userAuth && !userAuth.isAnonymous) {
          const user = await this.userService.getUser(userAuth.uid);
          const org = await this.orgService.getValue(user.orgId);

          // Starting orgState populate @TODO #6756 check if can be improved
          this.orgStore.upsert(org.id, org);
          this.orgStore.setActive(org.id);
          this.orgService.syncActive({ id: org.id });
        }

        /**
         * An anonymous account is created in order to fetch the required data for the event
         */
        if (!userAuth) { await this.authService.signInAnonymously(); }

        // Listenning for authState changes
        this.listenOnCurrentUserState();

        const eventState = this.eventStore.getValue();
        /**
        * With eventId and invitationId we can now evaluate what should be the next page
        */
        return this.service.getValue(route.params['eventId'] as string)
          .then(async event => {
            const currentUser = await this.authService.user;
            switch (event.accessibility) {
              case 'public':
              case 'invitation-only':
                // @TODO #6756 event is public, no invitation required
                
                if (currentUser.isAnonymous) {
                  return hasAnonymousIdentity(eventState, event.accessibility) || this.router.navigate([`/events/${event.id}`]);
                } else {
                  // User have a real account, we can find directly if he is owner or not
                  return true;
                }
              case 'private':
                // @TODO #6756 check invitationId in not logged in
                return true;
              /*default:
                return this.router.parseUrl(`/c/o/dashboard/event/${event.id}/edit/${path}`)*/
            }
          })
          .catch(e => {
            // Something went wrong, we redirect user to homepage
            console.log(e);
            this.router.navigate(['/']);
            return false;
          });

      })
    );

  }

  private listenOnCurrentUserState() {
    let user;
    this.afAuth.authState.subscribe(u => {
      if (user && !u) {
        this.router.navigate(['/']);
      } else {
        user = u;
      }
    });
  }
}

function hasAnonymousIdentity(eventState: EventState, accessibility: AccessibilityTypes) {
  const hasIdentity = !!eventState.lastName && !!eventState.firstName && !!eventState.role;
  return accessibility === 'public' ? hasIdentity : hasIdentity && !!eventState.email;
}