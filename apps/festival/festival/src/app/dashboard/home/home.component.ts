// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';

// Blockframes
import { MovieService, MovieQuery } from '@blockframes/movie/+state';
import { MovieAnalytics } from '@blockframes/movie/+state/movie.firestore';
import { OrganizationQuery } from '@blockframes/organization/+state';

// RxJs
import { map, switchMap, shareReplay, filter } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'festival-dashboard-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {

  private sub: Subscription;
  public movieAnalytics$: Observable<MovieAnalytics[]>;
  public hasMovies$: Observable<boolean>;

  constructor(
    private movieQuery: MovieQuery,
    private movieService: MovieService,
    private orgQuery: OrganizationQuery
  ) { }

  ngOnInit() {

    this.movieAnalytics$ = this.movieQuery.analytics.selectAll();

    const titles$ = this.orgQuery.selectActive().pipe(
      switchMap(({ movieIds }) => this.movieService.valueChanges(movieIds)),
      filter(movies => !!movies && movies.length >= 1),
      map(movies => movies.filter(movie => !!movie)),
      map(movies => movies.filter(movie => movie.storeConfig?.status === 'accepted')),
      shareReplay(1)
    )

    this.hasMovies$ = titles$.pipe(
      map(titles => !!titles.length)
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
