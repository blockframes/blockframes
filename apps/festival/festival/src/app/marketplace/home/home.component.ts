// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, HostBinding } from '@angular/core';

// Blockframes
import { MovieQuery, MovieService, Movie } from '@blockframes/movie/+state';
import { Organization } from '@blockframes/organization/+state';
import { sortMovieBy } from '@blockframes/utils/akita-helper/sort-movie-by';
import { AlgoliaService } from '@blockframes/utils/algolia/algolia.service';

// RxJs
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

// env
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

interface CarouselSection {
  title: string;
  movieCount$: Observable<number>;
  movies$: Observable<Movie[]>;
  queryParams?: Record<string, string>;
}

@Component({
  selector: 'festival-marketplace-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {

  @HostBinding('test-id="content"') testId

  public sections: CarouselSection[];
  public orgs$: Observable<Organization[]>;

  public featuredOrg$: Observable<Organization>;

  private sub: Subscription;

  constructor(
    private movieService: MovieService,
    private movieQuery: MovieQuery,
    private dynTitle: DynamicTitleService,
    private algoliaService: AlgoliaService
  ) { }

  ngOnInit() {
    this.algoliaService.queryForMovies({ activePage: 0, limitResultsTo: 20, facets: { genres: 'action' } })
    this.dynTitle.setPageTitle('Home');
    this.sub = this.movieService.syncCollection().subscribe();
    const selectMovies = (status: Movie['productionStatus']) => {
      return this.movieQuery.selectAll({
        filterBy: movie => movie.productionStatus === status && this.defaultFilter(movie)
      });
    }
    this.sections = [
      {
        title: 'New films',
        movieCount$: this.movieQuery.selectAll({ filterBy: movie => this.defaultFilter(movie) }).pipe(map(movies => movies.length)),
        movies$: this.movieQuery.selectAll({ filterBy: movie => this.defaultFilter(movie) }).pipe(
          map(movies => movies.sort((a, b) => sortMovieBy(a, b, 'Production Year'))),
        )
      },
      {
        title: 'In production',
        movieCount$: this.movieQuery.selectAll({
          filterBy: movie => (movie.productionStatus === 'shooting' || movie.productionStatus === 'post_production') && this.defaultFilter(movie)
        }).pipe(map(movies => movies.length)),
        movies$: this.movieQuery.selectAll({
          filterBy: movie => (movie.productionStatus === 'shooting' || movie.productionStatus === 'post_production') && this.defaultFilter(movie)
        }),
        queryParams: { productionStatus: 'shooting,post_production' }
      },
      {
        title: 'Completed films',
        movieCount$: selectMovies('finished').pipe(map(movies => movies.length)),
        movies$: selectMovies('finished'),
        queryParams: { productionStatus: 'finished' }
      },
      {
        title: 'In development',
        movieCount$: selectMovies('development').pipe(map(movies => movies.length)),
        movies$: selectMovies('development'),
        queryParams: { productionStatus: 'development' }
      },
    ];

    /* TODO 3498 */
    /*     this.orgs$ = this.organizationService
          .valueChanges(ref => ref
            .where('appAccess.festival.dashboard', '==', true)
            .where('status', '==', 'accepted'))
          .pipe(map(orgs => orgs.filter((org: Organization) => org.id !== centralOrgID && org.movieIds.length)));
    
        this.featuredOrg$ = this.orgs$.pipe(
          map(orgs => orgs.filter(org => org.movieIds.length > 3)),
          map(orgs => orgs[Math.floor(Math.random() * orgs.length)])
        ); */

  }

  defaultFilter(movie: Movie) {
    return movie.storeConfig.appAccess.festival
      && movie.storeConfig.status === "accepted";
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
