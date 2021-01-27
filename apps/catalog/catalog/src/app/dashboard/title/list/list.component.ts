import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { startWith, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { StoreStatus } from '@blockframes/utils/static-model/types';
import { Router, ActivatedRoute } from '@angular/router';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { fromOrg, MovieService } from '@blockframes/movie/+state/movie.service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { storeStatus } from '@blockframes/utils/static-model';

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

@Component({
  selector: 'catalog-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleListComponent {
  columns = columns;
  initialColumns = ['title', 'sales', 'receipt', 'status'];
  titles$: Observable<TitleView[]>;
  filter = new FormControl();
  filter$: Observable<StoreStatus> = this.filter.valueChanges.pipe(startWith(this.filter.value));
  // TODO #4797 Implement analytics when ready
  movies$ = this.service.valueChanges(fromOrg(this.orgQuery.getActiveId())).pipe(
    tap(movies => movies?.length ? this.dynTitle.setPageTitle('My titles') : this.dynTitle.setPageTitle('No titles')));

  constructor(
    private service: MovieService,
    private router: Router,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService,
    private orgQuery: OrganizationQuery
  ) { }

  /** Dynamic filter of movies for each tab. */
  applyFilter(filter?: StoreStatus) {
    this.filter.setValue(filter);
    this.dynTitle.setPageTitle(storeStatus[filter])
  }

  filterByMovie(movie: Movie, index: number, value: any): boolean {
    return value ? movie.storeConfig.status === value : true;
  }

  resetFilter() {
    this.filter.reset();
    this.dynTitle.useDefault();
  }

  goToTitle(title: Movie) {
    this.router.navigate([title.id], { relativeTo: this.route });
  }
}
