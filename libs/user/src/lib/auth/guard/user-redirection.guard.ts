import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class UserRedirectionGuard implements CanActivate {
  constructor(
    protected service: OrganizationService,
    protected router: Router,
    private afAuth: AngularFireAuth
  ) { }

  async canActivate() {
    // Here we use firestore auth because our auth store is empty at this point
    const user = await this.afAuth.currentUser;

    // If user is not logged in, stay on the page
    if (!user) {
      return true;
    }

    // Else, navigate to 'c/o' where other guards will take care of redirection
    return this.router.parseUrl(`c/o`);
  }
}
