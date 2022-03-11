import { Location } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AnalyticsService } from "@blockframes/analytics/+state";
import { MovieService } from "@blockframes/movie/+state/movie.service";
import { OrganizationService } from "@blockframes/organization/+state";
import { joinWith } from "@blockframes/utils/operators";
import { map, pluck, shareReplay, switchMap } from "rxjs/operators";
import { counter } from '@blockframes/analytics/+state/utils';


@Component({
  selector: 'festival-title-analytics',
  templateUrl: './title-analytics.component.html',
  styleUrls: ['./title-analytics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleAnalyticsComponent {

  titleId$ = this.route.params.pipe(
    pluck('titleId')
  );

  title$ = this.titleId$.pipe(
    switchMap((titleId: string) => this.movieService.valueChanges(titleId))
  );

  titleAnalytics$ = this.titleId$.pipe(
    switchMap((titleId: string) => this.analyticsService.getTitleAnalytics(titleId)),
    joinWith({
      org: analytic => this.orgService.valueChanges(analytic.meta.orgId)
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  orgActivity$ = this.titleAnalytics$.pipe(
    map(analytics => counter(analytics, 'org.activity', 'orgActivity'))
  );

  territoryActivity$ = this.titleAnalytics$.pipe(
    map(analytics => counter(analytics, 'org.addresses.main.country', 'territories')),
  );

  constructor(
    private location: Location,
    private movieService: MovieService,
    private orgService: OrganizationService,
    private route: ActivatedRoute,
    private analyticsService: AnalyticsService
  ) {}

  goBack() {
    this.location.back();
  }
}