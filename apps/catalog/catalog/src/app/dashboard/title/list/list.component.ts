import { Component, ChangeDetectionStrategy, Optional } from '@angular/core';
import { FormControl } from '@angular/forms';
import { map, startWith, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { StoreStatus } from '@blockframes/utils/static-model/types';
import { Router, ActivatedRoute } from '@angular/router';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { fromOrg, MovieService } from '@blockframes/movie/+state/movie.service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { storeStatus } from '@blockframes/utils/static-model';
import { Intercom } from 'ng-intercom';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { appName, getCurrentApp } from '@blockframes/utils/apps';

const columns = {
  'title.international': 'Title',
  'release.year': 'Release Year',
  directors: 'Director(s)',
  views: { value: '# Views', disableSort: true },
  'app.catalog.status': 'Status'
};

@Component({
  selector: 'catalog-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleListComponent {
  public app = getCurrentApp(this.routerQuery);
  public appName = appName[this.app];
  columns = columns;
  initialColumns = ['title.international', 'release.year', 'directors', 'views', 'app.catalog.status']; // 'sales' should be added here but removed due to the #5060 issue
  titles$: Observable<Movie[]>;
  filter = new FormControl();
  filter$: Observable<StoreStatus> = this.filter.valueChanges.pipe(startWith(this.filter.value));
  movies$ = this.service.valueChanges(fromOrg(this.orgQuery.getActiveId())).pipe(
    map(movies => movies.sort((movieA, movieB) => movieA.title.international < movieB.title.international ? -1 : 1)),
    map(movies => movies.filter(m => m.app.catalog.access)),
    tap(movies => movies?.length ? this.dynTitle.setPageTitle('My titles') : this.dynTitle.setPageTitle('My titles', 'Empty')));

  constructor(
    private service: MovieService,
    private router: Router,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService,
    private orgQuery: OrganizationQuery,
    private routerQuery: RouterQuery,
    @Optional() private intercom: Intercom
  ) { }

  /** Dynamic filter of movies for each tab. */
  applyFilter(filter?: StoreStatus) {
    this.filter.setValue(filter);
    this.dynTitle.setPageTitle(storeStatus[filter])
  }

  /* index paramter is unused because it is a default paramter from the filter javascript function */
  filterByMovie(movie: Movie, index: number, value: any): boolean {
    return value ? movie.app.catalog.status === value : true;
  }

  resetFilter() {
    this.filter.reset();
    this.dynTitle.useDefault();
  }

  goToTitle(title: Movie) {
    this.router.navigate([title.id], { relativeTo: this.route });
  }

  public openIntercom(): void {
    return this.intercom.show();
  }
}
