// Angular
import { Component, ChangeDetectionStrategy, Optional, Inject } from '@angular/core';

// Blockframes
import { MovieService, fromOrg } from '@blockframes/movie/+state/movie.service';
import { OrganizationService } from '@blockframes/organization/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import {
  EventName, hasAppStatus, App, territories,
  Organization, Analytics
} from '@blockframes/model';
import { APP } from '@blockframes/utils/routes/utils';
import { AnalyticsService } from '@blockframes/analytics/+state/analytics.service';
import { AnalyticData, counter } from '@blockframes/analytics/+state/utils';
import { joinWith } from '@blockframes/utils/operators';
import { unique } from '@blockframes/utils/helpers';

// RxJs
import { map, switchMap, shareReplay, tap, filter } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

// Intercom
import { Intercom } from 'ng-intercom';


interface TerritoryAndCountOption {
  orgs: Organization[],
  analytics: Analytics<'title'>[],
  orgIds: string[]
}

function getTerritoryAndCount({ orgs, analytics }: TerritoryAndCountOption): AnalyticData[] {
  const territoryEntries = Object.entries(territories)
    .filter(([key]) => key !== 'world');

  return territoryEntries.map(([key, label]: [string, string]) => {
    const orgsInTerritory = orgs
      .filter(o => o.addresses.main.country === key);

    const orgIds = orgsInTerritory.map(({ id }) => id);
    const analyticsOfCountry = analytics.filter(
      analytic => orgIds.includes(analytic.meta.orgId)
    );

    return { key, count: analyticsOfCountry.length, label };
  });
}


@Component({
  selector: 'dashboard-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
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
    map(analytics => analytics.sort((a, b) => a.count > b.count ? -1 : 1)),
    switchMap(([popularEvent]) => this.movieService.valueChanges(popularEvent.key))
  );

  private titleAnalyticsOfPopularTitle$ = combineLatest([this.popularTitle$, this.titleAnalytics$]).pipe(
    map(([title, titleAnalytics]) => titleAnalytics.filter(analytics => analytics.meta.titleId === title.id)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  orgActivityOfPopularTitle$ = this.titleAnalyticsOfPopularTitle$.pipe(
    map(analytics => counter(analytics, 'org.activity', 'orgActivity')),
  );

  territoryActivityOfPopularTitle$ = this.titleAnalyticsOfPopularTitle$.pipe(
    map(analytics => counter(analytics, 'org.addresses.main.country', 'territories')),
  );

  interactionsOfPopularTitle$ = this.titleAnalyticsOfPopularTitle$.pipe(
    map(analytics => analytics.filter(analytic => analytic.name !== 'pageView'))
  );

  pageViewsOfPopularTitle$ = this.titleAnalyticsOfPopularTitle$.pipe(
    map(analytics => analytics.filter(analytic => analytic.name === 'pageView'))
  );

  activeCountries$ = this.titleAnalytics$.pipe(
    filter(analytics => analytics.length > 0),
    map(analytics => {
      const orgs = analytics.map((analytic) => analytic.org)
      return { orgs, analytics };
    }),
    map(getTerritoryAndCount),
    map(stats => stats.sort(({ count: countA }, { count: countB }) => countA - countB))
  );

  interactions: EventName[] = [
    'addedToWishlist',
    'askingPriceRequested',
    'promoReelOpened',
    'screeningRequested',
  ];

  constructor(
    private analyticsService: AnalyticsService,
    private movieService: MovieService,
    private orgService: OrganizationService,
    private dynTitle: DynamicTitleService,
    @Optional() private intercom: Intercom,
    @Inject(APP) public app: App,
  ) { }

  public openIntercom(): void {
    return this.intercom.show();
  }
}
