import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AnalyticsService } from '@blockframes/utils/analytics/analytics.service';
import { pluck, switchMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'festival-title-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleActivityComponent {
  public movieAnalytics$ = this.route.params.pipe(
    pluck('movieId'),
    switchMap((movieId: string) => this.analyticsService.valueChanges([movieId])));

  constructor(
    private route: ActivatedRoute,
    private analyticsService: AnalyticsService,
  ) { }

}
