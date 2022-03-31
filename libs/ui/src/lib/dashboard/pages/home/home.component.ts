// Angular
import { Component, OnInit, ChangeDetectionStrategy, Optional, Inject } from '@angular/core';

// Blockframes
import { MovieService, fromOrg } from '@blockframes/movie/+state/movie.service';
import { OrganizationService } from '@blockframes/organization/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { hasAppStatus, Movie } from '@blockframes/model';
import { App } from '@blockframes/utils/apps';
import { APP } from '@blockframes/utils/routes/utils';
import { MovieAnalytics } from '@blockframes/analytics/components/movie-analytics-chart/movie-analytics.model';
import { AnalyticsService } from '@blockframes/analytics/+state/analytics.service';
import { toMovieAnalytics } from '@blockframes/analytics/components/movie-analytics-chart/utils';

// RxJs
import { map, switchMap, shareReplay, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

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

  public titlesAnalytics$: Observable<MovieAnalytics[]> = this.orgService.currentOrg$.pipe(
    switchMap(({ id }) => this.analytics.valueChanges(ref => ref
      .where('type', '==', 'title')
      .where('meta.ownerOrgIds', 'array-contains', id)
    )),
    map(toMovieAnalytics)
  )

  constructor(
    private movieService: MovieService,
    private orgService: OrganizationService,
    private dynTitle: DynamicTitleService,
    private analytics: AnalyticsService,
    @Optional() private intercom: Intercom,
    @Inject(APP) public app: App
  ) {}

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
