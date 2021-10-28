import { Component, ChangeDetectionStrategy, Optional } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { startWith, map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Intercom } from 'ng-intercom';
import { appName, getCurrentApp } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { StoreStatus } from '@blockframes/utils/static-model/types';


@Component({
  selector: 'festival-dashboard-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {
  public app = getCurrentApp(this.routerQuery);
  public appName = appName[this.app];
  filter = new FormControl();
  filter$ = this.filter.valueChanges.pipe(startWith(this.filter.value));

  titles$ = this.service.queryDashboard(this.app).pipe(
    tap(movies => this.dynTitle.setPageTitle('My titles', movies.length ? '' : 'Empty'))
  )

  titleCount$: Observable<Record<string, number>> = this.titles$.pipe(map(m => ({
    all: m.length,
    draft: m.filter(m => m.app.festival.status === 'draft').length,
    accepted: m.filter(m => m.app.festival.status === 'accepted').length,
    archived: m.filter(m => m.app.festival.status === 'archived').length,
  })));

  constructor(
    private service: MovieService,
    private router: Router,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService,
    private routerQuery: RouterQuery,
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
