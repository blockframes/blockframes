// Angular
import { Component, OnInit, ChangeDetectionStrategy, Optional } from '@angular/core';

// Blockframes
import { MovieService, fromOrg } from '@blockframes/movie/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Movie, MovieAnalytics } from '@blockframes/movie/+state/movie.model';
import { appName } from '@blockframes/utils/apps';
import { AppGuard } from '@blockframes/utils/routes/app.guard';

// RxJs
import { map, switchMap, shareReplay, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

// Intercom
import { Intercom } from 'ng-intercom';
import { AnalyticsService } from '@blockframes/analytics/+state/analytics.service';
import { toMovieAnalytics } from '@blockframes/movie/components/movie-analytics-chart/utils';

@Component({
  selector: 'dashboard-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {

  public app = this.appGuard.currentApp;
  public appName = appName[this.app];
  // accepted and submitted movies only
  public titles$: Observable<Movie[]>;
  public hasMovies$: Observable<boolean>;
  public hasAcceptedMovies$: Observable<boolean>;
  public hasDraftMovies$: Observable<boolean>;

  public titleAnalytics$: Observable<MovieAnalytics[]>;

  constructor(
    private analytics: AnalyticsService,
    private movieService: MovieService,
    private orgService: OrganizationService,
    private dynTitle: DynamicTitleService,
    private appGuard: AppGuard,
    @Optional() private intercom: Intercom
  ) { }

  ngOnInit() {
    const allMoviesFromOrg$ = this.orgService.currentOrg$.pipe(
      switchMap(({ id }) => this.movieService.valueChanges(fromOrg(id))),
      shareReplay({ refCount: true, bufferSize: 1 }),
      map(titles => titles.filter(title => title.app[this.app].access))
    );

    this.titleAnalytics$ = this.orgService.currentOrg$.pipe(
      switchMap(({ id }) => this.analytics.valueChanges(ref => ref
        .where('type', '==', 'title')
        .where('meta.ownerOrgIds', 'array-contains', id)
      )),
      map(toMovieAnalytics)
    );

    this.hasAcceptedMovies$ = allMoviesFromOrg$.pipe(
      map(movies => movies.some(movie => movie.app[this.app].status === 'accepted'))
    );

    this.hasMovies$ = allMoviesFromOrg$.pipe(
      map(movies => !!movies.length)
    );

    this.hasDraftMovies$ = allMoviesFromOrg$.pipe(
      map(movies => movies.some(movie => movie.app[this.app].status === 'draft'))
    )

    this.titles$ = allMoviesFromOrg$.pipe(
      map(movies => movies.filter(movie => ['accepted', 'submitted'].includes(movie.app[this.app].status))),
      tap(movies => {
        movies.length ?
          this.dynTitle.setPageTitle('Dashboard') :
          this.dynTitle.setPageTitle('Dashboard', 'Empty');
      }),
    );
  }

  public openIntercom(): void {
    return this.intercom.show();
  }
}
