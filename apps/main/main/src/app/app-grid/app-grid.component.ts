import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import {
  AppDetailsWithStatus,
  OrganizationQuery,
  OrganizationService
} from '@blockframes/organization';

@Component({
  selector: 'app-grid',
  templateUrl: './app-grid.component.html',
  styleUrls: ['./app-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppGridComponent implements OnInit, OnDestroy {
  public apps$: Observable<AppDetailsWithStatus[]>;
  private orgId: string;
  private orgIdSubscription: Subscription;

  constructor(
    private organizationQuery: OrganizationQuery,
    private organizationService: OrganizationService
  ) {}

  ngOnInit() {
    this.apps$ = this.organizationQuery.appsDetails$;
    this.orgIdSubscription = this.organizationQuery.orgId$.subscribe(orgId => (this.orgId = orgId));
  }

  ngOnDestroy(): void {
    this.orgIdSubscription.unsubscribe();
  }

  public requestAccess(appId: string) {
    return this.organizationService.requestAccessToApp(this.orgId, appId);
  }
}
