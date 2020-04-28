import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { StoreStatus, MovieAnalytics } from '@blockframes/movie/+state/movie.firestore';
import { startWith, map } from 'rxjs/operators';
import { Observable, combineLatest, Subscription } from 'rxjs';
import { Movie, getMovieTotalViews, Credit } from '@blockframes/movie/+state/movie.model';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { getCodeIfExists } from '@blockframes/utils/static-model/staticModels';

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
  view: '# View',
  director: 'Director(s)',
  productionStatus: 'Production Status',
  status: 'Status'
};

/** Factory function to flatten movie data. */
function createTitleView(
  movie: Movie,
  analytics: MovieAnalytics[]
): TitleView {
  const statusLabel = movie.main?.status ? getCodeIfExists('MOVIE_STATUS', movie.main?.status) : '';
  return {
    id: movie.id,
    title: movie.main.title.international,
    view: getMovieTotalViews(analytics, movie.id)?.toString(),
    director: movie.main.directors,
    productionStatus: statusLabel,
    status: movie.main.storeConfig.status
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
  public hasMovies$ = this.query.hasMovies();

  private sub: Subscription;

  constructor(
    private query: MovieQuery,
    private service: MovieService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.sub = this.service.syncAnalytics().subscribe();

    // Transform movies into a TitleView
    this.titles$ = combineLatest([this.query.selectAll(), this.query.analytics.selectAll()]).pipe(
      map(([movies, analytics]) =>
        movies.map(movie => createTitleView(movie, analytics))
      )
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
