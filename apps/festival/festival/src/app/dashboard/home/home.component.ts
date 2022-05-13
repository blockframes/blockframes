// Angular
import { Component, ChangeDetectionStrategy, Optional, Inject, Pipe, PipeTransform } from '@angular/core';

// Blockframes
import { MovieService, fromOrg } from '@blockframes/movie/+state/movie.service';
import { OrganizationService } from '@blockframes/organization/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import {
  EventName, hasAppStatus, App, territories,
  territoriesISOA3, TerritoryISOA3Value, Territory, Organization, Analytics
} from '@blockframes/model';
import { APP } from '@blockframes/utils/routes/utils';
import { AnalyticsService } from '@blockframes/analytics/+state/analytics.service';
import { counter } from '@blockframes/analytics/+state/utils';
import { joinWith } from '@blockframes/utils/operators';
import { unique } from '@blockframes/utils/helpers';

// RxJs
import { map, switchMap, shareReplay, tap, filter } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

// Intercom
import { Intercom } from 'ng-intercom';

interface TerritoryStat {
  territoryISOA3: TerritoryISOA3Value;
  count: number;
  territory: typeof territories[Territory],
}

interface TerritoryCount {
  lessThanOrEql5: TerritoryStat[],
  greaterThan5: TerritoryStat[],
  greaterThan50: TerritoryStat[],
  greaterThan100: TerritoryStat[],
}

interface TerritoryAndCountOption {
  orgs: Organization[],
  analytics: Analytics<'title'>[],
  orgIds: string[]
}

function getTerritoryAndCount({ orgs, analytics }: TerritoryAndCountOption): TerritoryStat[] {
  const iSOA3Names = Object.values(territoriesISOA3)
    .filter((country) => country !== '') as TerritoryISOA3Value[];
  return iSOA3Names.map(territoryISOA3 => {
    const orgsInTerritory = orgs
      .filter(o => territoriesISOA3[o.addresses.main.country] === territoryISOA3);

    const orgIds = orgsInTerritory.map(({ id }) => id);
    const analyticsOfCountry = analytics.filter(
      analytic => orgIds.includes(analytic.meta.orgId)
    );
    const territory = territories[orgsInTerritory[0]?.addresses?.main?.country]
    return { territoryISOA3, count: analyticsOfCountry.length, territory };
  });
}

function getCount(stats: TerritoryStat[]) {
  return stats.reduce(
    (acc, stat) => {
      if (stat.count > 100) acc.greaterThan100.push(stat);
      else if (stat.count > 50) acc.greaterThan50.push(stat);
      else if (stat.count > 5) acc.greaterThan5.push(stat);
      else acc.lessThanOrEql5.push(stat);
      return acc;
    },
    { lessThanOrEql5: [], greaterThan5: [], greaterThan50: [], greaterThan100: [], } as TerritoryCount
  );
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
      const orgIds = unique(analytics.map(analytic => analytic.meta.orgId));
      return { orgIds, analytics };
    }),
    joinWith({
      orgs: ({ orgIds }) => this.orgService.valueChanges(orgIds)
    }, { shouldAwait: true }),
    map(getTerritoryAndCount),
    map(stats => stats.sort(({ count: countA }, { count: countB }) => countA - countB)),
    map(getCount)
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


@Pipe({ name: 'combineStats' })
export class CombineStatsPipe implements PipeTransform {
  transform({ lessThanOrEql5, greaterThan5, greaterThan50, greaterThan100 }: TerritoryCount) {
    return [...greaterThan100, ...greaterThan50, ...greaterThan5, ...lessThanOrEql5];
  }
}
