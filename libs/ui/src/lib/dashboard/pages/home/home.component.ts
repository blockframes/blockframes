// Angular
import { Component, OnInit, ChangeDetectionStrategy, Optional, Inject } from '@angular/core';

// Blockframes
import { MovieService, fromOrg } from '@blockframes/movie/+state/movie.service';
import { OrganizationService } from '@blockframes/organization/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Movie } from '@blockframes/model';
import { App } from '@blockframes/utils/apps';
import { APP } from '@blockframes/utils/routes/utils';
import { AnalyticsService } from '@blockframes/analytics/+state/analytics.service';
import { counter } from '@blockframes/analytics/+state/utils';

// RxJs
import { map, switchMap, shareReplay, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

// Intercom
import { Intercom } from 'ng-intercom';
import { LineChartData } from '@blockframes/analytics/components/line-chart/line-chart.component';
import { joinWith } from '@blockframes/utils/operators';

@Component({
  selector: 'dashboard-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  // accepted and submitted movies only
  public titles$: Observable<Movie[]>;
  public hasMovies$: Observable<boolean>;
  public hasAcceptedMovies$: Observable<boolean>;
  public hasDraftMovies$: Observable<boolean>;

  public lineChartData: LineChartData[] = [
    {

      name: 'the first one',
      data: [
        { x: new Date('02-01-2022').getTime(), y: 10 },
        { x: new Date('03-01-2022').getTime(), y: 41 },
        { x: new Date('04-01-2022').getTime(), y: 35 },
        { x: new Date('05-01-2022').getTime(), y: 51 },
        { x: new Date('06-01-2022').getTime(), y: 49 },
        { x: new Date('07-01-2022').getTime(), y: 62 },
        { x: new Date('08-01-2022').getTime(), y: 69 },
        { x: new Date('09-01-2022').getTime(), y: 91 },
        { x: new Date('10-01-2022').getTime(), y: 148 },
      ]
    },
    {
      name: 'anoter one',
      data: [
        { x: new Date('02-01-2022').getTime(), y: 148 },
        { x: new Date('03-01-2022').getTime(), y: 91 },
        { x: new Date('04-01-2022').getTime(), y: 69 },
        { x: new Date('05-01-2022').getTime(), y: 62 },
        { x: new Date('06-01-2022').getTime(), y: 51 },
        { x: new Date('07-01-2022').getTime(), y: 49 },
        { x: new Date('08-01-2022').getTime(), y: 35 },
        { x: new Date('09-01-2022').getTime(), y: 41 },
        { x: new Date('10-01-2022').getTime(), y: 10 },
      ]
    }
  ]


  titleAnalytics$ = this.analyticsService.getGlobalAnalytics().pipe(
    joinWith({
      org: analytic => this.orgService.valueChanges(analytic.meta.orgId)
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  orgActivity$ = this.titleAnalytics$.pipe(
    map(analytics => counter(analytics, 'org.activity', 'orgActivity')),
    map(analytics => analytics.sort((a, b) => a.count - b.count).splice(0, 2))
  );

  territoryActivity$ = this.titleAnalytics$.pipe(
    map(analytics => counter(analytics, 'org.addresses.main.country', 'territories')),
    map(analytics => analytics.sort((a, b) => a.count - b.count).splice(0, 2))
  );

  interactions$ = this.titleAnalytics$.pipe(
    map(analytics => analytics.reduce((acc, curr) => {
      if (!acc[curr.name]) acc[curr.name] = { list: [], name: curr.name }
      acc[curr.name].list.push(curr)
    }, {} as any))
  );

  constructor(
    private analyticsService: AnalyticsService,
    private movieService: MovieService,
    private orgService: OrganizationService,
    private dynTitle: DynamicTitleService,
    @Optional() private intercom: Intercom,
    @Inject(APP) public app: App
  ) { }

  ngOnInit() {
    const allMoviesFromOrg$ = this.orgService.currentOrg$.pipe(
      switchMap(({ id }) => this.movieService.valueChanges(fromOrg(id))),
      shareReplay({ refCount: true, bufferSize: 1 }),
      map((titles) => titles.filter((title) => title.app[this.app].access))
    );

    this.hasAcceptedMovies$ = allMoviesFromOrg$.pipe(
      map((movies) => movies.some((movie) => movie.app[this.app].status === 'accepted'))
    );

    this.hasMovies$ = allMoviesFromOrg$.pipe(map((movies) => !!movies.length));

    this.hasDraftMovies$ = allMoviesFromOrg$.pipe(
      map((movies) => movies.some((movie) => movie.app[this.app].status === 'draft'))
    );

    this.titles$ = allMoviesFromOrg$.pipe(
      map((movies) =>
        movies.filter((movie) => ['accepted', 'submitted'].includes(movie.app[this.app].status))
      ),
      tap((movies) => {
        movies.length
          ? this.dynTitle.setPageTitle('Dashboard')
          : this.dynTitle.setPageTitle('Dashboard', 'Empty');
      })
    );
  }

  public openIntercom(): void {
    return this.intercom.show();
  }
}
