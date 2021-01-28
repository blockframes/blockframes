import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Component, OnInit, ChangeDetectionStrategy, Optional, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { MovieAnalytics } from '@blockframes/movie/+state/movie.firestore';
import { Intercom } from 'ng-intercom';
import { map, switchMap, tap } from 'rxjs/operators';
import { AnalyticsService } from '@blockframes/utils/analytics/analytics.service';
import { fromOrg, MovieService } from '@blockframes/movie/+state/movie.service';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { Movie } from '@blockframes/movie/+state/movie.model';

const isAcceptedInApp = movie => movie.storeConfig.status === 'accepted' && movie.storeConfig.appAccess.catalog === true;

@Component({
  selector: 'catalog-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {
  public movieAnalytics$: Observable<MovieAnalytics[]>;
  public movies$: Observable<Movie[]>;
  private sub: Subscription;

  constructor(
    private analyticsService: AnalyticsService,
    private movieService: MovieService,
    private orgQuery: OrganizationQuery,
    private dynTitle: DynamicTitleService,
    @Optional() private intercom: Intercom
  ) { }

  ngOnInit() {
    this.movies$ = this.orgQuery.selectActive().pipe(
      switchMap(({ id }) => this.movieService.valueChanges(fromOrg(id)))
    )

    this.movieAnalytics$ = this.orgQuery.selectActive().pipe(
      switchMap(({ id }) => this.movieService.valueChanges(fromOrg(id))),
      map(movies => movies.map(m => m.id)),
      tap(movieIds => {
        !!movieIds.length
          ? this.dynTitle.setPageTitle('Seller\'s Dashboard')
          : this.dynTitle.setPageTitle('New Title')
      }),
      switchMap(movieIds => this.analyticsService.valueChanges(movieIds)),
      map(analytics => analytics.filter(analytics => !!analytics)),
    )
    this.sub = this.movieAnalytics$.subscribe();
  }

  public openIntercom(): void {
    return this.intercom.show();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
