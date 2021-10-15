import { Component, ChangeDetectionStrategy, Optional } from '@angular/core';
import { FormControl } from '@angular/forms';
import { map, startWith, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { StoreStatus } from '@blockframes/utils/static-model/types';
import { Router, ActivatedRoute } from '@angular/router';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { storeStatus } from '@blockframes/utils/static-model';
import { Intercom } from 'ng-intercom';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { appName, getCurrentApp } from '@blockframes/utils/apps';

const columns = {
  'title.international': 'Title',
  'release.year': 'Release Year',
  'directors': 'Director(s)',
  'analytics.views': '# Views',
  'app.catalog.status': 'Status',
  'id': { value: '#Sales (Total Gross Receipt)', disableSort: true },
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
  initialColumns = ['title.international', 'release.year', 'directors', 'analytics.views', 'id', 'app.catalog.status'];
  filter = new FormControl();
  filter$: Observable<StoreStatus | ''> = this.filter.valueChanges.pipe(startWith(this.filter.value || ''));

  movies$ = this.service.queryDashboard(this.app).pipe(
    tap(movies => this.dynTitle.setPageTitle('My titles', movies.length ? '' : 'Empty'))
  )

  movieCount$ = this.movies$.pipe(map(m => ({
    all: m.length,
    draft: m.filter(m => m.app.catalog.status === 'draft').length,
    submitted: m.filter(m => m.app.catalog.status === 'submitted').length,
    accepted: m.filter(m => m.app.catalog.status === 'accepted').length,
    archived: m.filter(m => m.app.catalog.status === 'archived').length,
  })));

  constructor(
    private service: MovieService,
    private router: Router,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService,
    private routerQuery: RouterQuery,
    @Optional() private intercom: Intercom
  ) { }

  /** Dynamic filter of movies for each tab. */
  applyFilter(filter?: StoreStatus) {
    this.filter.setValue(filter);
    this.dynTitle.setPageTitle(storeStatus[filter]);
  }

  /* index paramater is unused because it is a default paramater from the filter javascript function */
  filterByMovie(movie: Movie, index: number, options): boolean {
    if (options.value) {
      return options?.exclude !== options.value ?
        movie.app.catalog.status === options.value && movie.app.catalog.status !== options.exclude :
        movie.app.catalog.status === options.value;
    } else {
      return options.exclude ? movie.app.catalog.status !== options.exclude : true;
    }
  }

  resetFilter() {
    this.filter.reset('');
    this.dynTitle.useDefault();
  }

  goToTitle(title: Movie) {
    this.router.navigate([title.id], { relativeTo: this.route });
  }

  public openIntercom(): void {
    return this.intercom.show();
  }
}
