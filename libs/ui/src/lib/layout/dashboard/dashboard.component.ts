// Angular
import { Component, ChangeDetectionStrategy, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { FormControl } from '@angular/forms';
import { MatSidenavContent, MatSidenav } from '@angular/material/sidenav';

// Blockframes
import { SearchResult } from '@blockframes/ui/search-widget/search-widget.component';
import { BreakpointsService } from '@blockframes/utils/breakpoint/breakpoints.service';
import { InvitationQuery } from '@blockframes/invitation/+state';
import { NotificationQuery } from '@blockframes/notification/+state';

// RxJs
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { algolia } from '@env';

@Component({
  selector: 'layout-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  private sub: Subscription;
  public invitationCount$ = this.invitationQuery.selectCount(invitation => invitation.status === 'pending');
  public notificationCount$ = this.notificationQuery.selectCount();
  public searchCtrl: FormControl = new FormControl('');

  public ltMd$ = this.breakpointsService.ltMd;

  public movieIndex = algolia.indexNameMovies;

  /**MovieAlgoliaResult Algolia search results */
  public algoliaSearchResults$: Observable<SearchResult[]>;

  @ViewChild(MatSidenav) sidenav: MatSidenav;
  @ViewChild(MatSidenavContent) sidenavContent: MatSidenavContent;
  @ViewChild(CdkVirtualScrollViewport) scrollViewport: CdkVirtualScrollViewport;

  constructor(
    private breakpointsService: BreakpointsService,
    private invitationQuery: InvitationQuery,
    private notificationQuery: NotificationQuery,
    private router: Router
  ) { }

  ngAfterViewInit() {
    // https://github.com/angular/components/issues/4280
    this.sub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => this.scrollViewport.scrollTo({ top: 0}))
  }

  ngOnDestroy() {
    if (this.sub) { this.sub.unsubscribe(); }
  }
}
