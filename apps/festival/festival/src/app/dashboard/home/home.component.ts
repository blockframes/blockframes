import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { MovieAnalytics } from '@blockframes/movie/+state/movie.firestore';
import { MovieService, MovieQuery } from '@blockframes/movie/+state';
import { map, switchMap, shareReplay } from 'rxjs/operators';
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
  public hasMovies$ : Observable<boolean>;

  constructor(
    private movieQuery: MovieQuery,
    private movieService: MovieService,
  ) {}

  ngOnInit() {
    this.movieAnalytics$ = this.movieQuery.analytics.selectAll();
    const titles$ = this.movieService.valueChanges(ref => ref.where('main.storeConfig.status', '==', 'accepted')).pipe(
      shareReplay(1)
    );

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
