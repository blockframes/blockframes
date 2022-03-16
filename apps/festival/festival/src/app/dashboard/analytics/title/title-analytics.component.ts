import { Location } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AggregatedAnalytic, createAggregatedAnalytic } from '@blockframes/model';
import { AnalyticsService } from '@blockframes/analytics/+state/analytics.service';
import { MovieService } from "@blockframes/movie/+state/movie.service";
import { OrganizationService } from "@blockframes/organization/+state";
import { joinWith } from "@blockframes/utils/operators";
import { map, pluck, shareReplay, switchMap } from "rxjs/operators";
import { counter } from '@blockframes/analytics/+state/utils';
import { UserService } from "@blockframes/user/+state";


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
      org: analytic => this.orgService.valueChanges(analytic.meta.orgId),
      user: analytic => this.userService.valueChanges(analytic.meta.uid)
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  orgActivity$ = this.titleAnalytics$.pipe(
    map(analytics => counter(analytics, 'org.activity', 'orgActivity'))
  );

  territoryActivity$ = this.titleAnalytics$.pipe(
    map(analytics => counter(analytics, 'org.addresses.main.country', 'territories')),
  );

  buyerAnalytics$ = this.titleAnalytics$.pipe(
    map(analytics => {
      const aggregator: Record<string, AggregatedAnalytic> = {};
      for (const analytic of analytics) {
        if (!analytic.user?.uid) continue;
        if (!aggregator[analytic.user.uid]) {
          aggregator[analytic.user.uid] = createAggregatedAnalytic({
            user: analytic.user,
            org: analytic.org
          });
        };
        aggregator[analytic.user.uid][analytic.name]++;
      }
      return Object.values(aggregator);
    })
  )

  constructor(
    private location: Location,
    private movieService: MovieService,
    private orgService: OrganizationService,
    private route: ActivatedRoute,
    private analyticsService: AnalyticsService,
    private userService: UserService,
  ) {}

  goBack() {
    this.location.back();
  }

  inWishlist(data: AggregatedAnalytic) {
    return data.addedToWishlist > data.removedFromWishlist;
  }
}