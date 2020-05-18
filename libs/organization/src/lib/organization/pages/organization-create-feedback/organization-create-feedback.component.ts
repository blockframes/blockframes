import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { OrganizationQuery, OrganizationService } from '@blockframes/organization/+state';
import { getCurrentApp } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'organization-create-feedback',
  templateUrl: './organization-create-feedback.component.html',
  styleUrls: ['./organization-create-feedback.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationCreateFeedbackComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  public workspace = this.query.getActive().appAccess[getCurrentApp(this.routerQuery)].dashboard
    ? 'dashboard'
    : 'marketplace';
  public isAccepted$ = this.query.selectActive().pipe(
    map(organization => organization.status === 'accepted')
  );

  constructor(
    private query: OrganizationQuery,
    private routerQuery: RouterQuery,
    private service: OrganizationService
  ) {}

  ngOnInit() {
    this.subscription = this.service.syncOrgActive().subscribe();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
