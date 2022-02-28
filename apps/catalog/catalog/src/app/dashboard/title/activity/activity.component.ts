import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { AnalyticsService } from '@blockframes/analytics/+state/analytics.service';
import { map, pluck, switchMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { DashboardTitleShellComponent } from '@blockframes/movie/dashboard/shell/shell.component';
import { toMovieAnalytics } from '@blockframes/movie/components/movie-analytics-chart/utils';
import { OrganizationService } from '@blockframes/organization/+state';

@Component({
  selector: 'catalog-title-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleActivityComponent implements OnInit {
  public movieAnalytics$ = this.route.params.pipe(
    pluck('movieId'),
    switchMap((movieId: string) => this.analyticsService.valueChanges(ref => ref
      .where('type', '==', 'title')
      .where('meta.titleId', '==', movieId)
      .where('meta.ownerOrgIds', 'array-contains', this.orgService.org?.id)
      )),
    map(toMovieAnalytics)
  );

  constructor(
    private route: ActivatedRoute,
    private analyticsService: AnalyticsService,
    private dynTitle: DynamicTitleService,
    private shell: DashboardTitleShellComponent,
    private orgService: OrganizationService
  ) { }

  ngOnInit() {
    const titleName = this.shell.movie?.title?.international || 'No title';
    this.dynTitle.setPageTitle(titleName, 'Marketplace Activity');
  }
}
