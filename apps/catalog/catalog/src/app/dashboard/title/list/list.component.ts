import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  Movie,
  MovieQuery,
  MovieService,
  getMovieReceipt,
  getMovieTotalViews
} from '@blockframes/movie';
import { startWith, switchMap, map, distinctUntilChanged } from 'rxjs/operators';
import { Observable, combineLatest, Subscription } from 'rxjs';
import { Contract } from '@blockframes/contract/contract/+state/contract.model';
import { StoreStatus, MovieAnalytics } from '@blockframes/movie/movie/+state/movie.firestore';
import { ContractQuery } from '@blockframes/contract/contract/+state/contract.query';
import { getContractLastVersion } from '@blockframes/contract/version/+state';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

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
  const ownContracts = contracts.filter(c => getContractLastVersion(c).titles[movie.id]);
  return {
    id: movie.id,
    title: movie.main.title.international,
    view: getMovieTotalViews(analytics, movie.id)?.toString(),
    sales: ownContracts.length,
    receipt: getMovieReceipt(ownContracts, movie.id),
    status: movie.main.storeConfig.status
  };
}

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

  private sub: Subscription;

  constructor(
    private query: MovieQuery,
    private contractQuery: ContractQuery,
    private service: MovieService,
    private router: Router,
    private route: ActivatedRoute,
    private title: Title
  ) { }

  ngOnInit() {
    this.sub = this.service.syncAnalytics().subscribe();
    const moviesAnalytics$ = this.query.analytics.selectAll();

    // Filtered movies
    const movies$ = this.filter$.pipe(
      switchMap(filter =>
        this.query.selectAll({
          filterBy: movie => (filter ? movie.main.storeConfig.storeType === filter : true)
        })
      )
    );
    // Transform movies into a TitleView
    this.titles$ = combineLatest([movies$, this.contractQuery.selectAll(), moviesAnalytics$]).pipe(
      map(([movies, contracts, analytics]) =>
        movies.map(movie => createTitleView(movie, contracts, analytics))
      )
    );
    Object.keys(this.query.getValue().entities).length
      ? this.title.setTitle('My titles - Archipel Content')
      : this.title.setTitle('No titles - Archipel Content')
  }

  /** Dynamic filter of movies for each tab. */
  applyFilter(filter?: Movie['main']['storeConfig']['storeType']) {
    this.filter.setValue(filter);
    filter === 'library'
      ? this.title.setTitle('Library titles - Archipel Content')
      : this.title.setTitle('Line-up titles - Archipel Content')
  }

  /** Navigate to tunnel if status is draft, else go to page */
  public goToTitle(title: TitleView) {
    const basePath = `/c/o/dashboard`;
    const path = (title.status === 'draft')
      ? `${basePath}/tunnel/movie/${title.id}`
      : `${basePath}/titles/${title.id}`;
    this.router.navigate([path], { relativeTo: this.route });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
