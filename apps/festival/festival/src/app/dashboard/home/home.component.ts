// Angular
import { Component, ChangeDetectionStrategy, Optional, Inject, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Blockframes
import { fromOrg, MovieService } from '@blockframes/movie/service';
import { OrganizationService } from '@blockframes/organization/service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { APP } from '@blockframes/utils/routes/utils';
import { AnalyticsService } from '@blockframes/analytics/service';
import {
  EventName,
  hasAppStatus,
  App,
  AggregatedAnalytic,
} from '@blockframes/model';
import { aggregate, counter, countedToAnalyticData } from '@blockframes/analytics/utils';
import { UserService } from '@blockframes/user/service';
import { unique } from '@blockframes/utils/helpers';
import { filters } from '@blockframes/ui/list/table/filters';

// RxJs
import { map, switchMap, shareReplay, tap, filter, distinctUntilChanged } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

// Intercom
import { Intercom } from 'ng-intercom';

// NgFire
import { joinWith } from 'ngfire';
import { scrollIntoView } from '@blockframes/utils/browser/utils';

@Component({
  selector: 'dashboard-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  @ViewChild('tableTitle') tableTitle: ElementRef;
  public selectedCountry?: string;
  public titles$ = this.orgService.currentOrg$.pipe(
    switchMap(({ id }) => this.movieService.valueChanges(fromOrg(id))),
    map((titles) => titles.filter((title) => title.app[this.app].access)),
    tap(titles => {
      titles.filter(hasAppStatus(this.app, ['accepted', 'submitted'])).length
        ? this.dynTitle.setPageTitle('Dashboard')
        : this.dynTitle.setPageTitle('Dashboard', 'Empty');
    })
  );

  titleAnalytics$ = this.analyticsService.getTitleAnalytics().pipe(
    joinWith({
      org: analytic => this.orgService.valueChanges(analytic.meta.orgId)
    }, { shouldAwait: true }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  popularTitle$ = this.titleAnalytics$.pipe(
    filter(analytics => analytics.length > 0),
    map(analytics => counter(analytics, 'meta.titleId')),
    map(counted => countedToAnalyticData(counted)),
    map(analyticData => analyticData.sort((a, b) => a.count > b.count ? -1 : 1)),
    switchMap(([popularEvent]) => this.movieService.valueChanges(popularEvent.key))
  );

  private titleAnalyticsOfPopularTitle$ = combineLatest([this.popularTitle$, this.titleAnalytics$]).pipe(
    map(([title, titleAnalytics]) => titleAnalytics.filter(analytics => analytics.meta.titleId === title.id)),
    distinctUntilChanged((a, b) => a.length === b.length),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  orgActivityOfPopularTitle$ = this.titleAnalyticsOfPopularTitle$.pipe(
    map(analytics => counter(analytics, 'org.activity')),
    map(counted => countedToAnalyticData(counted, 'orgActivity'))
  );

  territoryActivityOfPopularTitle$ = this.titleAnalyticsOfPopularTitle$.pipe(
    map(analytics => counter(analytics, 'org.addresses.main.country')),
    map(counted => countedToAnalyticData(counted, 'territories'))
  );

  interactionsOfPopularTitle$ = this.titleAnalyticsOfPopularTitle$.pipe(
    map(analytics => analytics.filter(analytic => analytic.name !== 'pageView'))
  );

  pageViewsOfPopularTitle$ = this.titleAnalyticsOfPopularTitle$.pipe(
    map(analytics => analytics.filter(analytic => analytic.name === 'pageView'))
  );

  activeCountries$ = this.titleAnalytics$.pipe(
    map(analytics => counter(analytics, 'org.addresses.main.country')),
    map(counted => countedToAnalyticData(counted, 'territories'))
  );

  activeBuyers$ = this.titleAnalytics$.pipe(
    filter(analytics => analytics.length > 0),
    map(analytics => {
      const uids = unique(analytics.map(analytic => analytic.meta.uid));
      const orgIds = unique(analytics.map(analytic => analytic.meta.orgId));
      return { uids, orgIds, analytics };
    }),
    joinWith({
      users: ({ uids }) => this.userService.valueChanges(uids),
      orgs: ({ orgIds }) => this.orgService.valueChanges(orgIds)
    }, { shouldAwait: true }),
    map(({ users, orgs, analytics }) => {
      return users.map(user => {
        const org = orgs.find(o => o.id === user.orgId);
        const analyticsOfUser = analytics.filter(analytic => analytic.meta.uid === user.uid);
        return aggregate(analyticsOfUser, { user, org });
      });
    }),
    map(users => users.sort((userA, userB) => userB.total - userA.total))
  );


  interactions: EventName[] = [
    'addedToWishlist',
    'askingPriceRequested',
    'promoReelOpened',
    'screeningRequested',
  ];

  filters = filters;

  constructor(
    private analyticsService: AnalyticsService,
    private movieService: MovieService,
    private orgService: OrganizationService,
    private dynTitle: DynamicTitleService,
    @Optional() private intercom: Intercom,
    private userService: UserService,
    @Inject(APP) public app: App,
    private router: Router,
    private route: ActivatedRoute,
    private cdr:ChangeDetectorRef
  ) { }

  public showBuyer(row: AggregatedAnalytic) {
    this.router.navigate([`/c/o/dashboard/home/buyer/${row.user.uid}`], { relativeTo: this.route })
  }

  public openIntercom(): void {
    return this.intercom.show();
  }

  public selectCountry(country:string){
    scrollIntoView(this.tableTitle.nativeElement);
    const scrollDuration = country ? 1000 : 0;
    setTimeout(() => {
      this.selectedCountry = country;
      this.cdr.markForCheck();
    }, scrollDuration);
  }
}
