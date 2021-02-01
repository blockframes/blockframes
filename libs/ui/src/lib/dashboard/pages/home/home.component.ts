// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';

// Blockframes
import { MovieService, fromOrg } from '@blockframes/movie/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Movie } from '@blockframes/movie/+state/movie.model';

// RxJs
import { map, switchMap, shareReplay, tap } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'dashboard-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {

  private sub: Subscription;

  public allMoviesFromOrg$: Observable<Movie[]>
  public hasAcceptedMovies$: Observable<boolean>;
  public hasMovies$: Observable<boolean>;

  constructor(
    private movieService: MovieService,
    private orgQuery: OrganizationQuery,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    this.allMoviesFromOrg$ = this.orgQuery.selectActive().pipe(
      switchMap(({ id }) => this.movieService.valueChanges(fromOrg(id))),
      shareReplay(1),
    );

    this.hasAcceptedMovies$ = this.allMoviesFromOrg$.pipe(
      map(movies => movies.some(movie => movie.storeConfig.status === 'accepted'))
    );

    this.hasMovies$ = this.allMoviesFromOrg$.pipe(
      map(movies => !!movies.length)
    );

    const titles$ = this.allMoviesFromOrg$.pipe(
      map(movies => movies.filter(movie => movie.storeConfig.status === 'accepted')),
      tap(movies => {
        !!movies.length ?
          this.dynTitle.setPageTitle('Dashboard') :
          this.dynTitle.setPageTitle('Dashboard', 'Empty');
      }),
    );

    this.sub = titles$.subscribe();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
