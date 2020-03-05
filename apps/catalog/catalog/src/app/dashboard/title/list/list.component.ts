import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  Movie,
  MovieQuery,
  MovieService,
  getMovieReceipt,
  getMovieTotalViews
} from '@blockframes/movie';
import { startWith, switchMap, map, distinctUntilChanged } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';
import { Contract } from '@blockframes/contract/contract/+state/contract.model';
import { StoreStatus, MovieAnalytics } from '@blockframes/movie/movie/+state/movie.firestore';
import { ContractQuery } from '@blockframes/contract/contract/+state/contract.query';
import { getContractLastVersion } from '@blockframes/contract/version/+state';
import { Router, ActivatedRoute } from '@angular/router';

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
    view: getMovieTotalViews(analytics, movie.id).toString(),
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
export class TitleListComponent implements OnInit {
  columns = columns;
  initialColumns = ['title', 'view', 'sales', 'receipt', 'status'];
  titles$: Observable<TitleView[]>;
  filter = new FormControl();
  filter$ = this.filter.valueChanges.pipe(startWith(this.filter.value));
  public allMovies$ = this.query.selectAll();

  constructor(
    private query: MovieQuery,
    private contractQuery: ContractQuery,
    private service: MovieService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Analytics from movies in the store
    const moviesAnalytics$ = this.query.selectAll().pipe(
      map(
        movies => movies.map(movie => movie.id),
        distinctUntilChanged((prev: string[], curr: string[]) => prev.length === curr.length)
      ),
      switchMap(movieIds => this.service.getMovieAnalytics(movieIds))
    );

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
  }

  /** Dynamic filter of movies for each tab. */
  applyFilter(filter?: Movie['main']['storeConfig']['storeType']) {
    this.filter.setValue(filter);
  }

  /** Navigate to tunnel if status is draft, else go to page */
  public goToTitle(title: TitleView) {
    const basePath = `/c/o/dashboard`;
    const path = (title.status === 'draft')
      ? `${basePath}/tunnel/movie/${title.id}`
      : `${basePath}/titles/${title.id}`;
    this.router.navigate([path], { relativeTo: this.route });
  }
}
