import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { startWith, switchMap, map } from 'rxjs/operators';
import { Observable, combineLatest, Subscription } from 'rxjs';
import { Contract } from '@blockframes/contract/contract/+state/contract.model';
import { MovieAnalytics } from '@blockframes/movie/+state/movie.firestore';
import { StoreStatus } from '@blockframes/utils/static-model/types';
import { ContractQuery } from '@blockframes/contract/contract/+state/contract.query';
import { Router, ActivatedRoute } from '@angular/router';
import { Movie, getMovieTotalViews, getMovieReceipt } from '@blockframes/movie/+state/movie.model';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

interface TitleView {
  id: string; // movieId
  title: string;
  view: string;
  sales: number;
  receipt: number;
  status: StoreStatus;
}

const columns = {
  title: 'Title',
  view: '# View',
  sales: 'Sales',
  receipt: 'Total Gross Receipts',
  status: 'Status'
};

/** Factory function to flatten movie data. */
function createTitleView(
  movie: Movie,
  contracts: Contract[],
  analytics: MovieAnalytics[]
): TitleView {
  const ownContracts = contracts.filter(c => c.lastVersion.titles[movie.id]);
  return {
    id: movie.id,
    title: movie.title.international,
    view: getMovieTotalViews(analytics, movie.id)?.toString(),
    sales: ownContracts.length,
    receipt: getMovieReceipt(ownContracts, movie.id),
    status: movie.storeConfig.status
  };
}

const isAcceptedInApp = (movie: Movie) => movie.storeConfig.appAccess.catalog === true;

@Component({
  selector: 'catalog-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleListComponent implements OnInit, OnDestroy {
  columns = columns;
  initialColumns = ['title', 'view', 'sales', 'receipt', 'status'];
  titles$: Observable<TitleView[]>;
  filter = new FormControl();
  filter$ = this.filter.valueChanges.pipe(startWith(this.filter.value));
  public allMovies$ = this.query.selectAll();
  public allMoviesLoading$ = this.query.selectLoading();

  private sub: Subscription;
  private titleSub: Subscription;

  constructor(
    private query: MovieQuery,
    private contractQuery: ContractQuery,
    private service: MovieService,
    private router: Router,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService
  ) { }

  ngOnInit() {
    // @todo(#2684) use syncWithAnalytics instead
    this.sub = this.service.syncAnalytics().subscribe();
    const moviesAnalytics$ = this.query.analytics.selectAll();

    // Filtered movies
    const movies$ = this.filter$.pipe(
      switchMap(filter =>
        this.query.selectAll({
          filterBy: movie => (filter ? movie.storeConfig.storeType === filter : true && isAcceptedInApp(movie))
        })
      )
    );
    // Transform movies into a TitleView
    this.titles$ = combineLatest([movies$, this.contractQuery.selectAll(), moviesAnalytics$]).pipe(
      map(([movies, contracts, analytics]) =>
        movies.map(movie => createTitleView(movie, contracts, analytics))
      )
    );
    this.titleSub = this.query.selectCount().subscribe(count => {
      count ? this.dynTitle.setPageTitle('My titles') : this.dynTitle.setPageTitle('No titles')
    })
  }

  /** Dynamic filter of movies for each tab. */
  applyFilter(filter?: Movie['storeConfig']['storeType']) {
    this.filter.setValue(filter);
    filter === 'library'
      ? this.dynTitle.setPageTitle('Library titles')
      : this.dynTitle.setPageTitle('Line-up titles')
  }

  public resetFilter() {
    this.filter.reset();
    this.dynTitle.useDefault();
  }

  /** Navigate to tunnel if status is draft, else go to page */
  public goToTitle(title: TitleView) {
    const basePath = `/c/o/dashboard`;
    const path = (title.status === 'draft')
      ? `${basePath}/tunnel/movie/${title.id}`
      : `${basePath}/title/${title.id}`;
    this.router.navigate([path], { relativeTo: this.route });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.titleSub.unsubscribe();
  }
}
