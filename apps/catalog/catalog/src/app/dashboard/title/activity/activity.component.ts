import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { AnalyticsService } from '@blockframes/analytics/+state/analytics.service';
import { map, pluck, switchMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { DashboardTitleShellComponent } from '@blockframes/movie/dashboard/shell/shell.component';
import { toMovieAnalytics } from '@blockframes/analytics/components/movie-analytics-chart/utils';

@Component({
  selector: 'catalog-title-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleActivityComponent implements OnInit {
  public movieAnalytics$ = this.route.params.pipe(
    pluck('movieId'),
    switchMap((titleId: string) => this.analyticsService.getTitleAnalytics(titleId)),
    map(toMovieAnalytics)
  );

  constructor(
    private route: ActivatedRoute,
    private analyticsService: AnalyticsService,
    private dynTitle: DynamicTitleService,
    private shell: DashboardTitleShellComponent
  ) { }

  ngOnInit() {
    const titleName = this.shell.movie?.title?.international || 'No title';
    this.dynTitle.setPageTitle(titleName, 'Marketplace Activity');
  }
}
