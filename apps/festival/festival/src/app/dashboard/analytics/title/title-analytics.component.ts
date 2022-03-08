import { Location } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Analytics, AnalyticsService, AnalyticsTypes } from "@blockframes/analytics/+state";
import { MovieService } from "@blockframes/movie/+state/movie.service";
import { Organization, OrganizationService } from "@blockframes/organization/+state";
import { joinWith } from "@blockframes/utils/operators";
import { toLabel } from "@blockframes/utils/utils";
import { map, pluck, switchMap } from "rxjs/operators";

type AnalyticsWithOrg = Analytics<AnalyticsTypes> & { org: Organization };

function toOrgActivity(analytics: AnalyticsWithOrg[]): Record<string, number> {
  const counter: Record<string, number> = {};
  for (const analytic of analytics) {
    const orgActivity = toLabel(analytic.org.activity, 'orgActivity');
    if (counter[orgActivity]) {
      counter[orgActivity]++;
    } else {
      counter[orgActivity] = 1;
    }
  }

  return counter;
}


@Component({
  selector: 'festival-title-analytics',
  templateUrl: './title-analytics.component.html',
  styleUrls: ['./title-analytics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleAnalyticsComponent {

  title$ = this.route.params.pipe(
    pluck('titleId'),
    switchMap((movieId: string) => this.movieService.valueChanges(movieId))
  );

  titleAnalytics$ = this.route.params.pipe(
    pluck('titleId'),
    switchMap((titleId: string) => this.analyticsService.getTitleAnalytics(titleId)),
    joinWith({
      org: analytic => this.orgService.valueChanges(analytic.meta.orgId)
    }),
  );

  orgActivity$ = this.titleAnalytics$.pipe(
    map(analytics => analytics.filter(analytic => analytic.org?.activity)),
    map(toOrgActivity)
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