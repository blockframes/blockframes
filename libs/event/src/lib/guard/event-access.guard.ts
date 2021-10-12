import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '@blockframes/auth/+state';
import { OrganizationService, OrganizationStore } from '@blockframes/organization/+state';
import { UserService } from '@blockframes/user/+state';
import { EventQuery } from '../+state';

@Injectable({ providedIn: 'root' })
export class EventAccessGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private orgService: OrganizationService,
    private eventQuery: EventQuery,
    private router: Router,
    private afAuth: AngularFireAuth,
    private orgStore: OrganizationStore,
  ) { }

  async canActivate(): Promise<boolean | UrlTree> {
    /**
     * In order to fetch the required data for the event, user needs to be connected with a
     * regular account (password) (or with an anonymous account will be created if not).
     */
    const currentUser = await this.authService.auth.currentUser;

    /**
     * If current user is not anonymous, we populate org stage
     */
    if (currentUser && !currentUser.isAnonymous) {
      const user = await this.userService.getUser(currentUser.uid);
      const org = await this.orgService.getValue(user.orgId);

      // Starting orgState populate
      this.orgStore.upsert(org.id, org);
      this.orgStore.setActive(org.id);
      this.orgService.syncActive({ id: org.id });
    }

    // Listenning for authState changes
    this.listenOnCurrentUserState();

    /**
     * An anonymous account is created in order to fetch the required data for the event
     */
    if (!currentUser) { await this.authService.signInAnonymously(); }

    /**
     * With eventId and invitationId we can now evaluate what should be the next page
     */
    const event = this.eventQuery.getActive();
    switch (event.accessibility) {
      case 'public':
        // @TODO #6756 event is public, no invitation required
        if (currentUser.isAnonymous) {
          // Redirect to "choose your role" page
        } else {
          // User have a real account, we can find directly if he is owner or not
        }
        return true;
      case 'invitation-only':
        // @TODO #6756 check invitationId if not logged in
        return true;
      case 'private':
        // @TODO #6756 check invitationId in not logged in 
        return true;
      /*default:
        return this.router.parseUrl(`/c/o/dashboard/event/${event.id}/edit/${path}`)*/
    }

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
