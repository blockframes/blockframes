import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Movie, MovieQuery } from '@blockframes/movie';
import { startWith, switchMap, map } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';
import { Contract, getValidatedContracts, getLastVersionIndex } from '@blockframes/contract/contract/+state/contract.model';
import { StoreStatus } from '@blockframes/movie/movie+state/movie.firestore';
import { CurrencyPipe } from '@angular/common';
import { ContractQuery } from '@blockframes/contract/contract/+state/contract.query';

interface TitleView {
  id: string;
  title: string;
  view: string;
  sales: number;
  receipt: string;
  status: StoreStatus;
}

/**
 * Factory function that flattens movie properties and make it usable in a reusable table.
 * @param movie
 * @param contracts
 */
function createTitleView(movie: Movie, contracts: Contract[]): TitleView {
  const ownContracts = contracts.filter(c => getContractLastVersion(c).titles[movie.id]);
  return {
    id: movie.id,
    title: movie.main.title.international,
    view: 'View',
    sales: ownContracts.length,
    receipt: getMovieReceipt(ownContracts, movie.id),
    status: movie.main.storeConfig.status
  };
}

/** Returns the total gross receipts of a movie from the contracts. */
function getMovieReceipt(contracts: Contract[], movieId: string) {
  const currencyPipe = new CurrencyPipe('en-US');
  const sales = getValidatedContracts(contracts);
  const amount = sales.reduce((sum, contract) => sum + contract.versions[getLastVersionIndex(contract)].titles[movieId].price.amount, 0);
  // We use USD as default currency as we can have different currencies for each deals and contracts.
  return currencyPipe.transform(amount, 'USD', 'symbol');
}

const columns = {
  title: 'Title',
  view: 'View',
  sales: 'Sales',
  receipt: 'Total Gross Receipts',
  status: 'Status'
};

@Component({
  selector: 'catalog-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleListComponent implements OnInit {
  columns = columns;
  initialColumns = ['title', 'view', 'sales', 'receipt', 'status', 'id'];
  titles$: Observable<TitleView[]>;
  filter = new FormControl();
  filter$ = this.filter.valueChanges.pipe(
    startWith(this.filter.value)
  );

  constructor(private query: MovieQuery, private contractQuery: ContractQuery) {}

  ngOnInit() {
    // Filtered movies
    const movies$ = this.filter$.pipe(
      switchMap(filter =>
        this.query.selectAll({
          filterBy: movie => (filter ? movie.main.storeConfig.storeType === filter : true)
        })
      )
    );
    // Transform movies into a TitleView
    this.titles$ = combineLatest([movies$, this.contractQuery.selectAll()]).pipe(
      map(([movies, contracts]) => movies.map(movie => this.createTitleView(movie, contracts)))
    );
  }

  /** Dynamic filter of movies for each tab. */
  applyFilter(filter?: Movie['main']['storeConfig']['storeType']) {
    this.filter.setValue(filter);
  }

  /** Factory function to flatten movie data. */
  public createTitleView(movie: Movie, contracts: Contract[]): TitleView {
    const ownContracts = contracts.filter(c => c.versions[getLastVersionIndex(c)].titles[movie.id]);
    return {
      id: movie.id,
      title: movie.main.title.international,
      view: 'View',
      sales: ownContracts.length,
      receipt: getMovieReceipt(ownContracts, movie.id),
      status: movie.main.storeConfig.status
    };
  }
}
