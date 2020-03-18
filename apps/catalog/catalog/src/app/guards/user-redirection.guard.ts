import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class UserRedirectionGuard implements CanActivate {
  constructor(
    protected service: OrganizationService,
    protected router: Router,
    private afAuth: AngularFireAuth,
    private organizationService: OrganizationService
  ) { }

  async canActivate() {
    // Here we use firestore auth because our auth store is empty at this point
    const user = await this.afAuth.currentUser;

    // If user is not logged in, stay on the page
    if (!user) {
      return true;
    }

    const organization = await this.organizationService.getUserOrganization(user.uid);

    // If user is logged but has no organization, redirect him on the organization tunnel
    if (!organization) {
      return this.router.parseUrl(`c/organization`);
    }

    // If user organization have an access to one app or both, redirect him on an app
    if (organization?.appAccess.catalogMarketplace) {
      return this.router.parseUrl('c/o/marketplace');
    }

    if (organization?.appAccess.catalogDashboard) {
      return this.router.parseUrl('c/o/dashboard')
    }

    return true;
  }
}
