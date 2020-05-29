import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { InvitationQuery, Invitation } from '@blockframes/invitation/+state';

export class SessionGuard implements CanActivate {
  constructor(
    private invitationQuery: InvitationQuery,
    private router: Router
  ) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const { eventId } = next.params;
    const canNavigate = this.invitationQuery.hasEntity((invitation: Invitation) => {
      return invitation.docId === eventId && invitation.status === 'accepted';
    });
    return canNavigate || this.router.parseUrl('..');
  }
}