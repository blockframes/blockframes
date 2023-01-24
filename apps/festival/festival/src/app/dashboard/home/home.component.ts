// Angular
import { Component, ChangeDetectionStrategy, Optional, Inject, ViewChild, ElementRef } from '@angular/core';
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
  createUser,
} from '@blockframes/model';
import { aggregate, counter, countedToAnalyticData, deletedUserIdentifier } from '@blockframes/analytics/utils';
import { UserService } from '@blockframes/user/service';
import { unique } from '@blockframes/utils/helpers';
import { filters } from '@blockframes/ui/list/table/filters';
import { scrollIntoView } from '@blockframes/utils/browser/utils';

// RxJs
import { map, switchMap, shareReplay, tap, filter, distinctUntilChanged } from 'rxjs/operators';
import { combineLatest, firstValueFrom, of } from 'rxjs';

// Intercom
import { Intercom } from 'ng-intercom';

// NgFire
import { joinWith } from 'ngfire';

@Component({
  selector: 'dashboard-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  @ViewChild('tableTitle') tableTitle: ElementRef;
  public selectedCountry?: string;
  public titles$ = firstValueFrom(this.orgService.currentOrg$.pipe(
    switchMap(({ id }) => this.movieService.valueChanges(fromOrg(id))), // TODO #9158
    map((titles) => titles.filter((title) => title.app[this.app].access)),
    tap(titles => {
      titles.filter(hasAppStatus(this.app, ['accepted', 'submitted'])).length
        ? this.dynTitle.setPageTitle('Dashboard')
        : this.dynTitle.setPageTitle('Dashboard', 'Empty');
    })
  ));

  private titleAnalytics$ = this.analyticsService.getTitleAnalytics().pipe( // TODO #9158 use titles$ to filter analytics data
    joinWith({
      org: analytic => this.orgService.valueChanges(analytic.meta.orgId)
    }, { shouldAwait: true }),
    map(analyticsWithOrg => {
      return analyticsWithOrg.filter(({ org }) => org && !org.appAccess.festival.dashboard); // TODO #9158 factorize with removeSellers ?
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private orgAnalytics$ = this.analyticsService.getOrganizationAnalytics().pipe(
    joinWith({
      org: analytic => this.orgService.valueChanges(analytic.meta.orgId)
    }, { shouldAwait: true }),
    map(analyticsWithOrg => {
      return analyticsWithOrg.filter(({ org }) => org && !org.appAccess.festival.dashboard); // TODO #9158 factorize with removeSellers ?
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  titleAndOrgAnalytics$ = combineLatest([this.titleAnalytics$, this.orgAnalytics$]).pipe(
    map(([titleAnalytics, orgAnalytics]) => [...titleAnalytics, ...orgAnalytics])
  );

  popularTitle$ = firstValueFrom(this.titleAnalytics$.pipe(
    map(analytics => counter(analytics, 'meta.titleId')),
    map(counted => countedToAnalyticData(counted)),
    map(analyticData => analyticData.sort((a, b) => a.count > b.count ? -1 : 1)),
    switchMap(([popularEvent]) => popularEvent ? this.movieService.valueChanges(popularEvent.key) : of(undefined))
  ));

  private titleAnalyticsOfPopularTitle$ = combineLatest([this.popularTitle$, this.titleAnalytics$]).pipe(
    map(([title, titleAnalytics]) => titleAnalytics.filter(analytics => analytics.meta.titleId === title.id)),
    distinctUntilChanged((a, b) => a.length === b.length),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  orgActivityOfPopularTitle$ = firstValueFrom(this.titleAnalyticsOfPopularTitle$.pipe(
    map(analytics => counter(analytics, 'org.activity')),
    map(counted => countedToAnalyticData(counted, 'orgActivity'))
  ));

  territoryActivityOfPopularTitle$ = firstValueFrom(this.titleAnalyticsOfPopularTitle$.pipe(
    map(analytics => counter(analytics, 'org.addresses.main.country')),
    map(counted => countedToAnalyticData(counted, 'territories'))
  ));

  interactionsOfPopularTitle$ = firstValueFrom(this.titleAnalyticsOfPopularTitle$.pipe(
    map(analytics => analytics.filter(analytic => analytic.name !== 'pageView'))
  ));

  pageViewsOfPopularTitle$ = firstValueFrom(this.titleAnalyticsOfPopularTitle$.pipe(
    map(analytics => analytics.filter(analytic => analytic.name === 'pageView'))
  ));

  activeCountries$ = firstValueFrom(this.titleAndOrgAnalytics$.pipe(  // TODO #9158
    map(analytics => counter(analytics, 'org.addresses.main.country')),
    map(counted => countedToAnalyticData(counted, 'territories'))
  ));

  activeBuyers$ = firstValueFrom(this.titleAndOrgAnalytics$.pipe(
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
    map(({ uids, users, orgs, analytics }) => {
      return uids.map(uid => {
        const user = users.filter(u => !!u).find(u => u.uid === uid) || createUser({ uid, lastName: deletedUserIdentifier });
        const org = user?.orgId ? orgs.find(o => o?.id === user.orgId) : undefined;
        const analyticsOfUser = analytics.filter(analytic => analytic.meta.uid === uid);
        return aggregate(analyticsOfUser, { user, org });
      });
    }),
    map(users => users.sort((userA, userB) => userB.interactions.global.count - userA.interactions.global.count))
  ));

  interactions: EventName[] = [
    'addedToWishlist',
    'askingPriceRequested',
    'promoElementOpened',
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
    private route: ActivatedRoute
  ) { }

  showBuyer(row: AggregatedAnalytic) {
    if (row.user.lastName !== deletedUserIdentifier) {
      this.router.navigate(['buyer', row.user.uid], { relativeTo: this.route });
    }
  }

  public openIntercom(): void {
    return this.intercom.show();
  }

  public selectCountry(country: string) {
    scrollIntoView(this.tableTitle.nativeElement);
    this.selectedCountry = country;
  }
}
