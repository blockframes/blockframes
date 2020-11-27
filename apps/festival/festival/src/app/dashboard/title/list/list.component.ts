import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { startWith, map, switchMap, tap, filter } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

const columns = {
  title: 'Title',
  view: '# Views',
  directors: 'Director(s)',
  productionStatus: 'Production Status',
  'storeConfig.status': 'Status'
};


@Component({
  selector: 'festival-dashboard-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {
  columns = columns;
  initialColumns = ['title', 'view', 'directors', 'productionStatus', 'storeConfig.status'];
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
  ) { }

  ngOnInit() {
    // Sync with anaytics: It's ok to give ALL movieIds they'll just be set to 0
    this.sub = this.orgQuery.selectActive().pipe(
      switchMap(org => this.service.syncWithAnalytics(org.movieIds)),
    ).subscribe();

    this.titles$ = this.orgQuery.selectActive().pipe(
      switchMap(org => this.service.valueChanges(org.movieIds)),
      map(movies => movies.filter(movie => !!movie)),
      map(movies => movies.filter(movie => movie.storeConfig.appAccess.festival)),
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
    this.sub.unsubscribe();
  }
}

