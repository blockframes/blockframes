// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';

// Blockframes
import { MovieQuery, MovieMain, MovieService, Movie } from '@blockframes/movie/+state';
import { OrganizationService, Organization } from '@blockframes/organization/+state';

// RxJs
import { Observable, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';

// env
import { centralOrgID } from '@env';

interface CarouselSection {
  title: string;
  movieCount$: Observable<number>;
  movies$: Observable<Movie[]>;
}

@Component({
  selector: 'festival-marketplace-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {

  public sections: CarouselSection[];
  public orgs$: Observable<Organization[]>;

  public featuredOrg$: Observable<Organization>;
  public featuredOrgMovies$: Observable<Movie[]>;

  private sub: Subscription;

  constructor(
    private movieService: MovieService,
    private movieQuery: MovieQuery,
    private organizationService: OrganizationService) { }

  ngOnInit() {
    this.sub = this.movieService.syncCollection(ref => ref.limit(50)).subscribe();
    const selectMovies = (status: MovieMain['status']) => {
      return this.movieQuery.selectAll({
        filterBy: movies => movies.main.status === status && movies.main.storeConfig.appAccess.festival && movies.main.storeConfig.status === "accepted"
      });
    }
    this.sections = [
      {
        title: 'New films',
        movieCount$: this.movieQuery.selectAll({ filterBy: movie => movie.main.storeConfig?.status === 'accepted' && movie.main.storeConfig.appAccess.festival }).pipe(map(movies => movies.length)),
        movies$: this.movieQuery.selectAll({ filterBy: movie => movie.main.storeConfig?.status === 'accepted' && movie.main.storeConfig.appAccess.festival })
      },
      {
        title: 'In production',
        movieCount$: selectMovies('shooting').pipe(map(movies => movies.length)),
        movies$: selectMovies('shooting')
      },
      {
        title: 'Completed films',
        movieCount$: selectMovies('finished').pipe(map(movies => movies.length)),
        movies$: selectMovies('finished')
      },
      {
        title: 'In development',
        movieCount$: selectMovies('financing').pipe(map(movies => movies.length)),
        movies$: selectMovies('financing')
      },
    ];

    this.orgs$  = this.organizationService
      .queryWithoutMovies(ref => ref
        .where('appAccess.festival.dashboard', '==', true)
        .where('status', '==', 'accepted'))
      .pipe(map(orgs => orgs.filter((org: Organization) => org.id !== centralOrgID)));

    this.featuredOrg$ = this.orgs$.pipe(
      map(orgs => orgs.filter(org => org.movieIds.length > 3)),
      map(orgs => orgs[Math.floor(Math.random() * orgs.length)]),
      tap((org: Organization) => {
        this.featuredOrgMovies$ = this.movieQuery.selectAll({
          filterBy: movie => {
            if (!org.movieIds) return false;
            return org.movieIds.includes(movie.id) &&
            movie.main.storeConfig?.status === 'accepted' &&
            movie.main.storeConfig.appAccess.festival;
          }
        });
      })
    );
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
