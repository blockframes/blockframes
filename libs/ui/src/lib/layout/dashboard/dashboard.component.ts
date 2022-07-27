// Angular
import { Component, ChangeDetectionStrategy, ViewChild, AfterViewInit, OnDestroy, Inject, HostBinding, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { FormControl } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';

// Blockframes
import { BreakpointsService } from '@blockframes/utils/breakpoint/breakpoints.service';
import { InvitationService } from '@blockframes/invitation/service';
import { NotificationService } from '@blockframes/notification/service';
import { applicationUrl } from '@blockframes/utils/apps';
import { APP } from '@blockframes/utils/routes/utils';
import { App } from '@blockframes/model';

// RxJs
import { fromEvent, Observable, Subscription } from 'rxjs';
import { filter, map, shareReplay } from 'rxjs/operators';

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
  private subs: Subscription[] = [];
  public searchCtrl: FormControl = new FormControl('');
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
  public showNavigation = false;

  /**MovieAlgoliaResult Algolia search results */
  public algoliaSearchResults$: Observable<SearchResult[]>;

  @ViewChild(MatSidenav) sidenav: MatSidenav;
  @ViewChild(CdkScrollable) cdkScrollable: CdkScrollable;
  @HostBinding('class.opened') opened = false;

  constructor(
    private breakpointsService: BreakpointsService,
    private invitationService: InvitationService,
    private notificationService: NotificationService,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    @Inject(APP) public currentApp: App
  ) { }

  ngAfterViewInit() {
    // https://github.com/angular/components/issues/4280
    const sub$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => this.cdkScrollable.scrollTo({ top: 0 }))

    // toggle Navigation desktop/mobile on resize
    const resizeSub$ = fromEvent(window, 'resize').subscribe(() => {
      if (this.showNavigation) {
        // this.toggleNavigation();
        this.cdRef.markForCheck();
      }
    });

    this.subs.push(sub$, resizeSub$);
  }

  ngOnDestroy() {
    this.subs.forEach(s => s?.unsubscribe());
  }

  toggleNavigation() {
    this.showNavigation = !this.showNavigation;
  }

  closeNavigation() {
    this.showNavigation = false;
  }
}
