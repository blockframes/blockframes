// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';

// Blockframes
import { MovieService, MovieQuery, fromOrg } from '@blockframes/movie/+state';
import { MovieAnalytics } from '@blockframes/movie/+state/movie.firestore';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

// RxJs
import { map, switchMap, shareReplay, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'dashboard-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {

  private sub: Subscription;
  public movieAnalytics$: Observable<MovieAnalytics[]>;
  public hasAcceptedMovies$: Observable<boolean>;
  public hasMovies$: Observable<boolean>;
  public isDataLoaded$: Observable<boolean>;

  constructor(
    private movieQuery: MovieQuery,
    private movieService: MovieService,
    private orgQuery: OrganizationQuery,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    const _isDataLoaded$ = new BehaviorSubject<boolean>(false);
    this.isDataLoaded$ = _isDataLoaded$.asObservable();

    this.movieAnalytics$ = this.movieQuery.analytics.selectAll();

    const allMoviesFromOrg$ = this.orgQuery.selectActive().pipe(
      switchMap(({ id }) => this.movieService.valueChanges(fromOrg(id))),
      map(movies => movies.filter(movie => !!movie)),
      shareReplay(1),
      tap(_ => _isDataLoaded$.next(true))
    );

    this.hasAcceptedMovies$ = allMoviesFromOrg$.pipe(
      map(movies => movies.some(movie => movie.storeConfig.status === 'accepted'))
    );

    this.hasMovies$ = allMoviesFromOrg$.pipe(
      map(movies => !!movies.length)
    );

    const titles$ = allMoviesFromOrg$.pipe(
      map(movies => movies.filter(movie => movie.storeConfig.status === 'accepted')),
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
