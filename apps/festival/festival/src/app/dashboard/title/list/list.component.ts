import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { startWith, map, switchMap, tap } from 'rxjs/operators';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { getMovieTotalViews, Movie, MovieAnalytics } from '@blockframes/movie/+state/movie.model';
import { fromOrg, MovieService } from '@blockframes/movie/+state/movie.service';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MovieQuery } from '@blockframes/movie/+state';

const columns = {
  'title.international': 'Title',
  view: '# Views',
  directors: 'Director(s)',
  productionStatus: 'Production Status',
  'storeConfig.status': 'Status'
};

function createTitleView(movie: Movie, analytics: MovieAnalytics[]) {
  return {
    view: getMovieTotalViews(analytics, movie.id)?.toString(),
    ...movie
  }
}

@Component({
  selector: 'festival-dashboard-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {
  columns = columns;
  initialColumns = ['title.international', 'view', 'directors', 'productionStatus', 'storeConfig.status'];
  titles$: Observable<Movie[]>;
  filter = new FormControl();
  filter$ = this.filter.valueChanges.pipe(startWith(this.filter.value));

  private sub: Subscription;

  constructor(
    private service: MovieService,
    private orgQuery: OrganizationQuery,
    private router: Router,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService,
    private movieQuery: MovieQuery
  ) { }

  ngOnInit() {
    this.sub = this.service.valueChanges(fromOrg(this.orgQuery.getActive().id)).pipe(
      switchMap(movies => this.service.syncWithAnalytics(movies.map(m => m.id)))
    ).subscribe();
    const movieAnalytics$ = this.movieQuery.analytics.selectAll();
    this.titles$ = combineLatest([this.service.valueChanges(fromOrg(this.orgQuery.getActive().id)), movieAnalytics$]).pipe(
      map(([movies, analytics]) => movies.filter(movie => movie.storeConfig.appAccess.festival).map(movie =>
        createTitleView(movie, analytics))),
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

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
