import { Component, ChangeDetectionStrategy, OnInit, Optional } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { startWith, map, tap, switchMap } from 'rxjs/operators';
import { combineLatest, Observable, of } from 'rxjs';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { fromOrg, MovieService } from '@blockframes/movie/+state/movie.service';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Intercom } from 'ng-intercom';
import { appName, getCurrentApp } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { StoreStatus } from '@blockframes/utils/static-model/types';
import { AnalyticsService } from '@blockframes/utils/analytics/analytics.service';
import { getViews } from '@blockframes/movie/pipes/analytics.pipe';

const columns = {
  'title.international': 'Title',
  views: '# Views',
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
export class ListComponent {
  public app = getCurrentApp(this.routerQuery);
  public appName = appName[this.app];
  columns = columns;
  initialColumns = ['title.international', 'views', 'directors', 'productionStatus', 'app.festival.status'];
  filter = new FormControl();
  filter$ = this.filter.valueChanges.pipe(startWith(this.filter.value));

  titles$: Observable<Movie[]> = this.service.valueChanges(fromOrg(this.orgQuery.getActiveId())).pipe(
    map(movies => movies.filter(movie => !!movie)),
    map(movies => movies.filter(movie => movie.app.festival.access)),
    switchMap(movies => combineLatest([
      of(movies),
      this.analytics.valueChanges(movies.map(movie => movie.id)).pipe(map(analytics => analytics.map(getViews)))
    ])),
    map(([ movies, views ]) => movies.map((movie, i) => ({ ...movie, views: views[i] })) ),
    map(movies => movies.sort((movieA, movieB) => movieA.title.international > movieB.title.international ? 1 : -1)),
    tap(movies => {
      movies.length ?
        this.dynTitle.setPageTitle('My titles') :
        this.dynTitle.setPageTitle('My titles', 'Empty');
    })
  )

  titleCount$: Observable<Record<string, number>> = this.titles$.pipe(map(m => ({
    all: m.length,
    draft: m.filter(m => m.app.festival.status === 'draft').length,
    accepted: m.filter(m => m.app.festival.status === 'accepted').length,
    archived: m.filter(m => m.app.festival.status === 'archived').length,
  })));

  constructor(
    private service: MovieService,
    private orgQuery: OrganizationQuery,
    private router: Router,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService,
    private routerQuery: RouterQuery,
    private analytics: AnalyticsService,
    @Optional() private intercom: Intercom
  ) { }

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
  filterByMovie(movie: Movie, index: number, options): boolean {
    if (options.value) {
      return options?.exclude !== options.value ?
        movie.app.festival.status === options.value && movie.app.festival.status !== options.exclude :
        movie.app.festival.status === options.value;
    } else {
      return options.exclude ? movie.app.festival.status !== options.exclude : true;
    }
  }

}
