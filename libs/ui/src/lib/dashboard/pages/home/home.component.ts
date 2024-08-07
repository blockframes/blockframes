// Angular
import { Component, ChangeDetectionStrategy, Optional, Inject } from '@angular/core';
import { where } from 'firebase/firestore';

// Blockframes
import { fromOrgAndAccessible, MovieService } from '@blockframes/movie/service';
import { OrganizationService } from '@blockframes/organization/service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { hasAppStatus, App } from '@blockframes/model';
import { APP } from '@blockframes/utils/routes/utils';
import { MovieAnalytics } from '@blockframes/analytics/components/movie-analytics-chart/movie-analytics.model';
import { AnalyticsService } from '@blockframes/analytics/service';
import { toMovieAnalytics } from '@blockframes/analytics/components/movie-analytics-chart/utils';

// RxJs
import { map, switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

// Intercom
import { Intercom } from '@supy-io/ngx-intercom';

@Component({
  selector: 'dashboard-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  public titles$ = this.orgService.currentOrg$.pipe(
    switchMap(({ id }) => this.movieService.valueChanges(fromOrgAndAccessible(id, this.app))),
    tap(titles => {
      titles.filter(hasAppStatus(this.app, ['accepted', 'submitted'])).length
        ? this.dynTitle.setPageTitle('Dashboard')
        : this.dynTitle.setPageTitle('Dashboard', 'Empty');
    })
  );

  public titlesAnalytics$: Observable<MovieAnalytics[]> = this.orgService.currentOrg$.pipe(
    switchMap(({ id }) => this.analytics.valueChanges([
      where('type', '==', 'title'),
      where('meta.ownerOrgIds', 'array-contains', id)
    ])),
    map(toMovieAnalytics)
  )

  constructor(
    private movieService: MovieService,
    private orgService: OrganizationService,
    private dynTitle: DynamicTitleService,
    private analytics: AnalyticsService,
    @Optional() private intercom: Intercom,
    @Inject(APP) public app: App
  ) { }

  public openIntercom(): void {
    return this.intercom.show();
  }
}
