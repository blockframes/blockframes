import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '@blockframes/auth/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { UserService } from '@blockframes/user/+state';
import { hasDisplayName } from '@blockframes/utils/helpers';
import { EventService } from '../+state';

@Injectable({ providedIn: 'root' })
export class EventTestGuard implements CanActivate {

  constructor(
    private service: EventService,
    private authService: AuthService,
    private userService: UserService,
    private orgService: OrganizationService,
    private router: Router,
  ) { }

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
    /**
     * In order to fetch the required data for the event, user needs to be connected with a
     * regular account (password) (or with an anonymous account will be created if not).
     */
    const currentUser = await this.authService.auth.currentUser;

    /**
     * If current user is not anonymous, we need to check that his onboarding is completed (basic infos + orgId)
     * before letting him access the event
     */
    if (currentUser && !currentUser.isAnonymous) {
      const user = await this.userService.getUser(currentUser.uid);
      if (!user._meta.emailVerified || !hasDisplayName(user) || !user.orgId) {
        return this.router.createUrlTree(['/auth/identity']);
      }

      const org = await this.orgService.getValue(user.orgId);
      if (org.status === 'pending') {
        return this.router.createUrlTree(['c/organization/create-congratulations']);
      }
    }

    /**
     * An anonymous account is created in order to fetch the required data for the event
     */
    if (!currentUser) { await this.authService.signInAnonymously(); }

    /**
     * With eventId and invitationId we can now evaluate what should be the next page
     */
    return this.service.getValue(route.params['eventId'] as string)
      .then(event => {
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
      })
      .catch(e => {
        // Something went wrong, we redirect user to homepage
        console.log(e);
        this.router.navigate(['/']);
        return false;
      });
  }


}
