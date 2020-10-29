// Angular
import { Component, ChangeDetectionStrategy, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { FormControl } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';

// Blockframes
import { SearchResult } from '@blockframes/ui/search-widget/search-widget.component';
import { BreakpointsService } from '@blockframes/utils/breakpoint/breakpoints.service';
import { InvitationQuery } from '@blockframes/invitation/+state';
import { NotificationQuery } from '@blockframes/notification/+state';

// RxJs
import { Observable, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { algolia } from '@env';
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Component({
  selector: 'layout-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  private sub: Subscription;
  public searchCtrl: FormControl = new FormControl('');
  public notificationCount$ = this.notificationQuery.selectCount();
  public invitationCount$ = this.invitationQuery.toMe(invitation => invitation.status === 'pending').pipe(
    map(invitations => invitations.length)
  );

  public ltMd$ = this.breakpointsService.ltMd;

  public movieIndex: string;

  /**MovieAlgoliaResult Algolia search results */
  public algoliaSearchResults$: Observable<SearchResult[]>;

  @ViewChild(MatSidenav) sidenav: MatSidenav;
  @ViewChild(CdkScrollable) cdkScrollable: CdkScrollable;

  constructor(
    private breakpointsService: BreakpointsService,
    private invitationQuery: InvitationQuery,
    private notificationQuery: NotificationQuery,
    private router: Router,
    private routerQuery: RouterQuery
  ) { }

  ngAfterViewInit() {
    const appName = this.routerQuery.getValue().state?.root.data.app;
    // https://github.com/angular/components/issues/4280
    this.sub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => this.cdkScrollable.scrollTo({ top: 0 }))
  }

  ngOnDestroy() {
    if (this.sub) { this.sub.unsubscribe(); }
  }
}
