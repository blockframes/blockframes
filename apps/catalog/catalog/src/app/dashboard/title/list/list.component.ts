import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { startWith, map, tap } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';
import { Contract } from '@blockframes/contract/contract/+state/contract.model';
import { StoreStatus, StoreType } from '@blockframes/utils/static-model/types';
import { ContractQuery } from '@blockframes/contract/contract/+state/contract.query';
import { Router, ActivatedRoute } from '@angular/router';
import { Movie, getMovieReceipt } from '@blockframes/movie/+state/movie.model';
import { fromOrg, MovieService } from '@blockframes/movie/+state/movie.service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationQuery } from '@blockframes/organization/+state';

interface TitleView {
  id: string;
  title: string;
  sales: number;
  receipt: number;
  status: StoreStatus;
}

const columns = {
  title: 'Title',
  sales: 'Sales',
  receipt: 'Total Gross Receipts',
  status: 'Status'
};

/** Factory function to flatten movie data. */
function createTitleView(
  movie: Movie,
  contracts: Contract[],
): TitleView {
  const ownContracts = contracts.filter(c => c.lastVersion.titles[movie.id]);
  return {
    id: movie.id,
    title: movie.title.international,
    sales: ownContracts.length,
    receipt: getMovieReceipt(ownContracts, movie.id),
    status: movie.storeConfig.status
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
  initialColumns = ['title', 'sales', 'receipt', 'status'];
  titles$: Observable<TitleView[]>;
  filter = new FormControl();
  filter$: Observable<StoreType> = this.filter.valueChanges.pipe(startWith(this.filter.value));
  movies$: Observable<Movie[]>;

  constructor(
    private contractQuery: ContractQuery,
    private service: MovieService,
    private router: Router,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService,
    private orgQuery: OrganizationQuery
  ) { }

  ngOnInit() {
    this.movies$ = this.service.valueChanges(fromOrg(this.orgQuery.getActiveId()));
    // TODO #4797 Implement analytics when ready
    // Transform movies into a TitleView
    this.titles$ = combineLatest([this.movies$, this.contractQuery.selectAll(), this.filter$]).pipe(
      map(([movies, contracts, filter]) => movies.map(movie =>
        movie.storeConfig.storeType === filter || filter === null
          ? createTitleView(movie, contracts)
          : null)
        .filter(movie => !!movie)),
      tap(movies => movies?.length ? this.dynTitle.setPageTitle('My titles') : this.dynTitle.setPageTitle('No titles')));

  }

  /** Dynamic filter of movies for each tab. */
  applyFilter(filter?: StoreType) {
    this.filter.setValue(filter);
    filter === 'library'
      ? this.dynTitle.setPageTitle('Library titles')
      : this.dynTitle.setPageTitle('Line-up titles')
  }

  public resetFilter() {
    this.filter.reset();
    this.dynTitle.useDefault();
  }

  public goToTitle(title: Movie) {
    this.router.navigate([title.id], { relativeTo: this.route });
  }
}
