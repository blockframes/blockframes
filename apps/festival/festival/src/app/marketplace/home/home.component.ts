// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';

// Blockframes
import { MovieQuery, MovieService, Movie } from '@blockframes/movie/+state';
import { OrganizationService, Organization } from '@blockframes/organization/+state';

// RxJs
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

// env
import { centralOrgID } from '@env';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

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

  private sub: Subscription;

  constructor(
    private movieService: MovieService,
    private movieQuery: MovieQuery,
    private organizationService: OrganizationService,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Home');
    this.sub = this.movieService.syncCollection(ref => ref.limit(50)).subscribe();
    const selectMovies = (status: Movie['productionStatus']) => {
      return this.movieQuery.selectAll({
        filterBy: movies => movies.productionStatus === status && movies.storeConfig.appAccess.festival && movies.storeConfig.status === "accepted"
      });
    }
    this.sections = [
      {
        title: 'New films',
        movieCount$: this.movieQuery.selectAll({ filterBy: movie => movie.storeConfig?.status === 'accepted' && movie.storeConfig.appAccess.festival }).pipe(map(movies => movies.length)),
        movies$: this.movieQuery.selectAll({ filterBy: movie => movie.storeConfig?.status === 'accepted' && movie.storeConfig.appAccess.festival })
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

    this.orgs$ = this.organizationService
      .valueChanges(ref => ref
        .where('appAccess.festival.dashboard', '==', true)
        .where('status', '==', 'accepted'))
      .pipe(map(orgs => orgs.filter((org: Organization) => org.id !== centralOrgID && org.movieIds.length)));

    this.featuredOrg$ = this.orgs$.pipe(
      map(orgs => orgs.filter(org => org.movieIds.length > 3)),
      map(orgs => orgs[Math.floor(Math.random() * orgs.length)])
    );

  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
