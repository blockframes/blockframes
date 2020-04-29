import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { OrganizationService, OrganizationQuery } from '../../+state';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { getCurrentApp } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Component({
  selector: 'organization-app-access',
  templateUrl: './organization-app-access.component.html',
  styleUrls: ['./organization-app-access.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationAppAccessComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  public access = new FormControl();

  constructor(
    private service: OrganizationService,
    private query: OrganizationQuery,
    private router: Router,
    private route: ActivatedRoute,
    private routerQuery: RouterQuery,
  ) { }

  ngOnInit() {
    this.subscription = this.service.syncOrgActive().subscribe();
  }

  async submit() {

    const appName = getCurrentApp(this.routerQuery);
    const orgId = this.query.getActiveId();

    switch (appName) {
      case 'catalog':
      default:
        await this.service.update(orgId, {
          appAccess: {
            catalog: {
              marketplace: this.access.value === 'marketplace',
              dashboard: this.access.value === 'dashboard'
            },
            festival: {
              marketplace: false,
              dashboard: false
            },
          }
        });
        break;
      case 'festival':
        await this.service.update(orgId, {
          appAccess: {
            catalog: {
              marketplace: false,
              dashboard: false
            },
            festival: {
              marketplace: this.access.value === 'marketplace',
              dashboard: this.access.value === 'dashboard'
            },
          }
        });
        break;
    }

    this.router.navigate(['../create-congratulations'], { relativeTo: this.route });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
