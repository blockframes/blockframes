import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MovieAnalytics } from '@blockframes/movie/+state/movie.firestore';
import { StoreStatus } from '@blockframes/utils/static-model/types';
import { startWith, map, switchMap } from 'rxjs/operators';
import { Observable, combineLatest, Subscription } from 'rxjs';
import { Movie, getMovieTotalViews, Credit } from '@blockframes/movie/+state/movie.model';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { staticConsts } from '@blockframes/utils/static-model';

interface TitleView {
  id: string; // movieId
  title: string;
  view: string;
  director: Credit[];
  productionStatus: string;
  status: StoreStatus;
}

const columns = {
  title: 'Title',
  view: '# Views',
  director: 'Director(s)',
  productionStatus: 'Production Status',
  status: 'Status'
};

/** Factory function to flatten movie data. */
function createTitleView(
  movie: Movie,
  analytics: MovieAnalytics[]
): TitleView {
  const statusLabel = movie.productionStatus ? staticConsts['productionStatus'][movie.productionStatus] : '';

  return {
    id: movie.id,
    title: movie.title.international,
    view: getMovieTotalViews(analytics, movie.id)?.toString(),
    director: movie.directors,
    productionStatus: statusLabel,
    status: movie.storeConfig.status
  };
}

@Component({
  selector: 'festival-dashboard-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {
  columns = columns;
  initialColumns = ['title', 'view', 'director', 'productionStatus', 'status'];
  titles$: Observable<TitleView[]>;
  filter = new FormControl();
  filter$ = this.filter.valueChanges.pipe(startWith(this.filter.value));
  public hasMovies$ = this.orgQuery.hasMovies$;

  private sub: Subscription;

  constructor(
    private query: MovieQuery,
    private service: MovieService,
    private orgQuery: OrganizationQuery,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    // Sync with anaytics: It's ok to give ALL movieIds they'll just be set to 0
    this.sub = this.orgQuery.selectActive().pipe(
      switchMap(org => this.service.syncWithAnalytics(org.movieIds)),
    ).subscribe();

    const titles$ = this.orgQuery.selectActive().pipe(
      switchMap(org => this.service.valueChanges(org.movieIds)),
      map(movies => movies.filter(movie => movie.storeConfig.appAccess.festival))
    );
    const analytics$ = this.query.analytics.selectAll().pipe(startWith([]));

    // Transform movies into a TitleView
    this.titles$ = combineLatest([ titles$, analytics$ ]).pipe(
      map(([movies, analytics]) => movies.map(movie => createTitleView(movie, analytics)))
    );
  }

  /** Navigate to tunnel if status is draft, else go to page */
  public goToTitle(title: TitleView) {
    const path = `/c/o/dashboard/title/${title.id}`;
    this.router.navigate([path], { relativeTo: this.route });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
