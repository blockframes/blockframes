import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { OrganizationService, OrganizationQuery } from '../../+state';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { getCurrentApp, createOrgAppAccess } from '@blockframes/utils/apps';
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
    private routerQuery: RouterQuery
  ) { }

  ngOnInit() {
    this.subscription = this.service.syncOrgActive().subscribe();
  }

  async submit() {

    const appName = getCurrentApp(this.routerQuery);
    const orgAppAccess = createOrgAppAccess({
      [appName]: {
        marketplace: this.access.value === 'marketplace',
        dashboard: this.access.value === 'dashboard'
      }
    });

    await this.service.update(this.query.getActiveId(), {
      appAccess: orgAppAccess
    });
    this.router.navigate(['../create-congratulations'], { relativeTo: this.route });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
