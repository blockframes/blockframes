import { Component, OnInit, ChangeDetectionStrategy, Optional } from '@angular/core';
import { Observable } from 'rxjs';
import { MovieAnalytics } from '@blockframes/movie/+state/movie.firestore';
import { Intercom } from 'ng-intercom';
import { map, switchMap } from 'rxjs/operators';
import { fromOrg, MovieService } from '@blockframes/movie/+state/movie.service';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { AnalyticsService } from '@blockframes/utils/analytics/analytics.service';

@Component({
  selector: 'catalog-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  public titleAnalytics$: Observable<MovieAnalytics[]>;
  public titles$: Observable<Movie[]>;

  constructor(
    private analyticsService: AnalyticsService,
    private movieService: MovieService,
    private orgQuery: OrganizationQuery,
    @Optional() private intercom: Intercom
  ) { }

  ngOnInit() {
    this.titleAnalytics$ = this.orgQuery.selectActive().pipe(
      switchMap(({ id }) => this.movieService.valueChanges(fromOrg(id))),
      map(titles => titles.map(t => t.id)),
      switchMap(ids => this.analyticsService.valueChanges(ids))
    )
  }

  public openIntercom(): void {
    return this.intercom.show();
  }

}
