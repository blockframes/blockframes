import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Movie, MovieQuery } from '@blockframes/movie';
import { startWith, switchMap, share, map } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';
import { ContractQuery, Contract, getLastVersionIndex } from '@blockframes/contract/contract/+state';
import { StoreStatus } from '@blockframes/movie/movie+state/movie.firestore';

interface TitleView {
  title: string;
  view: string;
  sales: number;
  receipt: number;
  status: StoreStatus;
}

function createTitleView(movie: Movie, contracts: Contract[]): TitleView {
  const ownContracts = contracts.filter(c => c.versions[getLastVersionIndex(c)].titles[movie.id]);
  return {
    title: movie.main.title.international,
    view: 'View',
    sales: ownContracts.length,
    receipt: ownContracts.reduce((sum, contract) => sum + contract.versions[getLastVersionIndex(contract)].titles[movie.id].price.amount, 0),
    status: movie.main.storeConfig.status
  }
}

const columns = {
  title: 'Title',
  view: 'View',
  sales: 'Sales',
  receipt: 'Total Gross Receipts',
  status: 'Status'
}

@Component({
  selector: 'catalog-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleListComponent implements OnInit {
  columns = columns;
  initialColumns = ['title', 'view']
  titles$: Observable<TitleView[]>;
  filter = new FormControl()
  filter$ = this.filter.valueChanges.pipe(
    startWith(this.filter.value),
    share(),
  );

  constructor(
    private query: MovieQuery,
    private contractQuery: ContractQuery
  ) {}

  ngOnInit() {
    // Filtered movies
    const movies$ = this.filter$.pipe(
      switchMap(filter => this.query.selectAll({
        filterBy: movie => filter ? movie.main.storeConfig.storeType === filter : true
      })),
    );
    // Transform movies into a TitleView
    combineLatest([
      movies$,
      this.contractQuery.selectAll(),
    ]).pipe(
      map(([movies, contracts]) => movies.map(movie => createTitleView(movie, contracts)))
    )
  }

  applyFilter(filter?: Movie['main']['storeConfig']['storeType']) {
    this.filter.setValue(filter);
  }
}
