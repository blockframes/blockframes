// Angular
import { Component, ChangeDetectionStrategy, ViewChild, AfterViewInit, OnDestroy, Inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { UntypedFormControl } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';

// Blockframes
import { BreakpointsService } from '@blockframes/utils/breakpoint/breakpoints.service';
import { InvitationService } from '@blockframes/invitation/service';
import { NotificationService } from '@blockframes/notification/service';
import { applicationUrl } from '@blockframes/utils/apps';
import { APP } from '@blockframes/utils/routes/utils';
import { App } from '@blockframes/model';

// RxJs
import { Observable, Subscription } from 'rxjs';
import { filter, map, shareReplay } from 'rxjs/operators';
import { AuthService } from '@blockframes/auth/service';

interface SearchResult {
  title: string;
  icon: string;
  /** path between current route and item */
  path: string;
  items: Record<string, string>[];
}

interface AppBridge {
  text: string;
  link: string;
  logo: string;
}
type BridgeRecord = Partial<Record<App, AppBridge>>;
@Component({
  selector: 'layout-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  private sub: Subscription;
  public searchCtrl: UntypedFormControl = new UntypedFormControl('');
  public notificationCount$ = this.notificationService.myNotificationsCount$;
  public appBridge: BridgeRecord = {
    catalog: {
      text: 'Promote Your Line-up',
      link: applicationUrl.festival,
      logo: 'mini_logo_festival'
    },
    festival: {
      text: 'Sell Content',
      link: applicationUrl.catalog,
      logo: 'mini_logo_catalog'
    }
  }

  public invitationCount$ = this.invitationService.invitationCount();

  public mode$ = this.breakpointsService.ltMd.pipe(
    map(ltMd => ltMd ? 'over' : 'side'),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  public movieIndex: string;

  /**MovieAlgoliaResult Algolia search results */
  public algoliaSearchResults$: Observable<SearchResult[]>;

  @ViewChild(MatSidenav) sidenav: MatSidenav;
  @ViewChild(CdkScrollable) cdkScrollable: CdkScrollable;

  constructor(
    private breakpointsService: BreakpointsService,
    private invitationService: InvitationService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router,
    @Inject(APP) public currentApp: App
  ) { }

  ngAfterViewInit() {
    // https://github.com/angular/components/issues/4280
    this.sub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => this.cdkScrollable.scrollTo({ top: 0 }));
  }

  ngOnDestroy() {
    if (this.sub) { this.sub.unsubscribe(); }
  }
}
