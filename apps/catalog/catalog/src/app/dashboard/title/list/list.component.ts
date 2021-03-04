import { Component, ChangeDetectionStrategy } from '@angular/core';
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

@Component({
  selector: 'catalog-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleListComponent {
  columns = {
    title: 'TITLE',
    release: 'RELEASE YEAR',
    directors: 'DIRECTOR(S)',
    views: '# VIEWS',
    sales: 'SALES (Total Gross Receipts)',
    storeConfig: 'STATUS'
  };
  initialColumns = ['title', 'release', 'directors', 'views', 'sales', 'storeConfig'];
  titles$: Observable<Movie[]>;
  filter = new FormControl();
  filter$: Observable<StoreStatus> = this.filter.valueChanges.pipe(startWith(this.filter.value));
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

  /* index paramter is unused because it is a default paramter from the filter javascript function */
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
