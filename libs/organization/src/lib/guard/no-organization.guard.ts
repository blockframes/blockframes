import { Injectable } from '@angular/core';
import { Organization, OrganizationService, OrganizationStatus } from '../+state';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

// TODO: issue#1171, use a CollectionGuard
@Injectable({ providedIn: 'root' })
export class NoOrganizationGuard {
  private subscription: Subscription;

  constructor(private orgService: OrganizationService, private router: Router) {}

  canActivate() {
    return new Promise(res => {
      this.subscription = this.orgService.sync().subscribe({
        next: (organization: Organization) => {
          if (!organization) {
            return res(true);
          }
          if (organization.status === OrganizationStatus.pending) {
            return res(this.router.parseUrl('layout/organization/congratulations'));
          }
          return res(true);
        },
        error: err => {
          res(true);
        }
      });
    });
  }

  canDeactivate() {
    this.subscription.unsubscribe();
    return true;
  }
}

