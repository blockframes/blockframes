import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { MovieAnalytics } from '@blockframes/movie/+state/movie.firestore';
import { MovieService, MovieQuery } from '@blockframes/movie/+state';
import { map, switchMap, shareReplay, tap } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'festival-dashboard-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {

  private sub: Subscription;
  public movieAnalytics$: Observable<MovieAnalytics[]>;
  public hasAcceptedMovies$: Observable<boolean>;
  public hasMovies$: Observable<boolean>;
  constructor(
    private movieQuery: MovieQuery,
    private movieService: MovieService,
    private orgQuery: OrganizationQuery,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    this.movieAnalytics$ = this.movieQuery.analytics.selectAll();

    const allMoviesFromOrg$ = this.orgQuery.selectActive().pipe(
      switchMap(({ movieIds }) => this.movieService.valueChanges(movieIds)),
      shareReplay(1)
    );

    this.hasAcceptedMovies$ = allMoviesFromOrg$.pipe(
      map(movies => movies.some(movie => movie.main?.storeConfig.status === 'accepted'))
    );

    this.hasMovies$ = allMoviesFromOrg$.pipe(
      map(movies => !!movies.length)
    );

    const titles$ = allMoviesFromOrg$.pipe(
      map(movies => movies.filter(movie => movie.main?.storeConfig.status === 'accepted')),
      tap(movies => {
        !!movies.length ?
          this.dynTitle.setPageTitle('Dashboard') :
          this.dynTitle.setPageTitle('Dashboard', 'Empty');
      }),
    );

    this.sub = titles$.pipe(
      map(movies => movies.map(m => m.id)),
      switchMap(movieIds => this.movieService.syncWithAnalytics(movieIds))
    ).subscribe();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
