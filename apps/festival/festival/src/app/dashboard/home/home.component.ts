// Angular
import { Component, OnInit, ChangeDetectionStrategy, Optional, Inject } from '@angular/core';

// Blockframes
import { MovieService, fromOrg } from '@blockframes/movie/+state/movie.service';
import { OrganizationService } from '@blockframes/organization/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { hasAppStatus, Movie } from '@blockframes/model';
import { App } from '@blockframes/utils/apps';
import { APP } from '@blockframes/utils/routes/utils';
import { AnalyticsService } from '@blockframes/analytics/+state/analytics.service';
import { joinWith } from '@blockframes/utils/operators';
import { counter } from '@blockframes/analytics/+state/utils';

// RxJs
import { map, switchMap, shareReplay, tap, filter } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';

// Intercom
import { Intercom } from 'ng-intercom';

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

  titleAnalytics$ = this.analyticsService.getAnalytics().pipe(
    joinWith({
      org: analytic => this.orgService.valueChanges(analytic.meta.orgId)
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  popularTitle$ = this.titleAnalytics$.pipe(
    filter(analytics => analytics.length > 0),
    map(analytics => counter(analytics, 'meta.titleId')),
    map(analytics => analytics.sort((a, b) => a.count > b.count ? -1 : 1)),
    switchMap(([popularEvent]) => this.movieService.valueChanges(popularEvent.key)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  orgActivityOfPopularTitle$ = combineLatest([
    this.popularTitle$,
    this.titleAnalytics$
  ]).pipe(
    map(([title, titleAnalytics]) => titleAnalytics.filter(analytics => analytics.meta.titleId === title.id)),
    map(analytics => counter(analytics, 'org.activity', 'orgActivity'))
  )

  territoryActivityOfPopularTitle$ = combineLatest([
    this.popularTitle$,
    this.titleAnalytics$
  ]).pipe(
    map(([title, titleAnalytics]) => titleAnalytics.filter(analytics => analytics.meta.titleId === title.id)),
    map(analytics => counter(analytics, 'org.addresses.main.country', 'territories')),
  )

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
      map((movies) => movies.some(hasAppStatus(this.app, ['accepted'])))
    );

    this.hasMovies$ = allMoviesFromOrg$.pipe(map((movies) => !!movies.length));

    this.hasDraftMovies$ = allMoviesFromOrg$.pipe(
      map((movies) => movies.some(hasAppStatus(this.app, ['draft'])))
    );

    this.titles$ = allMoviesFromOrg$.pipe(
      map((movies) => movies.filter(hasAppStatus(this.app, ['accepted', 'submitted']))),
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
