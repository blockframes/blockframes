import { Component, ChangeDetectionStrategy, OnInit, Optional } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { startWith, map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { fromOrg, MovieService } from '@blockframes/movie/+state/movie.service';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Intercom } from 'ng-intercom';
import { appName, getCurrentApp } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { StoreStatus } from '@blockframes/utils/static-model/types';

const columns = {
  'title.international': 'Title',
  view: { value: '# Views', disableSort: true },
  directors: 'Director(s)',
  productionStatus: 'Production Status',
  'app.festival.status': 'Status'
};

@Component({
  selector: 'festival-dashboard-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit {
  public app = getCurrentApp(this.routerQuery);
  public appName = appName[this.app];
  columns = columns;
  initialColumns = ['title.international', 'view', 'directors', 'productionStatus', 'app.festival.status'];
  titles$: Observable<Movie[]>;
  filter = new FormControl();
  filter$ = this.filter.valueChanges.pipe(startWith(this.filter.value));

  constructor(
    private service: MovieService,
    private orgQuery: OrganizationQuery,
    private router: Router,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService,
    private routerQuery: RouterQuery,
    @Optional() private intercom: Intercom
  ) { }

  ngOnInit() {
    this.titles$ = this.service.valueChanges(fromOrg(this.orgQuery.getActive().id)).pipe(
      map(movies => movies.filter(movie => !!movie)),
      map(movies => movies.filter(movie => movie.app.festival.access)),
      map(movies => movies.sort((movieA, movieB) => movieA.title.international > movieB.title.international ? 1 : -1)),
      tap(movies => {
        movies.length ?
          this.dynTitle.setPageTitle('My titles') :
          this.dynTitle.setPageTitle('My titles', 'Empty');
      })
    );
  }

  /** Navigate to tunnel if status is draft, else go to page */
  public goToTitle(title: Movie) {
    this.router.navigate([title.id], { relativeTo: this.route });
  }

  public openIntercom(): void {
    return this.intercom.show();
  }

  /** Dynamic filter of movies for each tab. */
  applyFilter(filter?: StoreStatus) {
    this.filter.setValue(filter);
  }

  resetFilter() {
    this.filter.reset();
  }

  /* index paramater is unused because it is a default paramater from the filter javascript function */
  filterByTitle(movie: Movie, index: number, value): boolean {
    return value ? movie.app.festival.status === value : true;
  }

}
