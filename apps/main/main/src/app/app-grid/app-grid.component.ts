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
  private subscription: Subscription;
  public apps$: Observable<AppDetailsWithStatus[]>;

  constructor(
    private organizationQuery: OrganizationQuery,
    private organizationService: OrganizationService
  ) {}

  ngOnInit() {
    this.subscription = this.organizationService.syncAppsDetails().subscribe();
    this.apps$ = this.organizationQuery.appsDetails$;
  }

  public requestAccess(appId: string) {
    const orgId = this.organizationQuery.getActiveId();
    return this.organizationService.requestAccessToApp(orgId, appId);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
