import { Injectable } from '@angular/core';
import { Organization, OrganizationService, OrganizationStatus } from '../+state';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

// TODO issue#1146
import { AFM_DISABLE } from '@env';

@Injectable({ providedIn: 'root' })
export class OrganizationGuard {
  private subscription: Subscription;

  constructor(private orgService: OrganizationService, private router: Router) {}

  canActivate() {
    return new Promise(res => {
      this.subscription = this.orgService.sync().subscribe({
        next: (organization: Organization) => {
          if (!organization) {
            return res(false);
          }
          if (organization.status === OrganizationStatus.pending) {
            return res(this.router.parseUrl('layout/organization/congratulation'));
          }

          // TODO issue#1146
          if (AFM_DISABLE) {
            this.orgService.retrieveDataAndAddListeners();
          }

          return res(true);
        },
        error: err => {
          console.log('Error: ', err);
          res(this.router.parseUrl('layout/organization'));
        }
      });
    });
  }

  canDeactivate() {
    this.subscription.unsubscribe();

    // TODO issue#1146
    if (AFM_DISABLE) {
      this.orgService.removeAllListeners();
    }

    return true;
  }
}
