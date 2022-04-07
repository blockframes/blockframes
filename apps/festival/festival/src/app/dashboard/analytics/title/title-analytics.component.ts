import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AggregatedAnalytic, Analytics, createAggregatedAnalytic, Organization, User, Scope, staticModel } from '@blockframes/model';
import { AnalyticsService } from '@blockframes/analytics/+state/analytics.service';
import { MovieService } from "@blockframes/movie/+state/movie.service";
import { joinWith } from "@blockframes/utils/operators";
import { map, pluck, shareReplay, switchMap } from "rxjs/operators";
import { counter } from '@blockframes/analytics/+state/utils';
import { UserService } from "@blockframes/user/+state";
import { NavigationService } from "@blockframes/ui/navigation.service";

function getFilter(scope: Scope) {
  return (input: string, value: any) => {
    if (typeof value !== 'string') return false;
    const label = staticModel[scope][value];
    return label.toLowerCase().includes(input);
  };
}

function aggregatePerUser(analytics: (Analytics<"title"> & { user: User, org: Organization})[]) {
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
}

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
    switchMap((titleId: string) => this.movieService.valueChanges(titleId)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  titleAnalytics$ = this.titleId$.pipe(
    switchMap((titleId: string) => this.analyticsService.getTitleAnalytics(titleId)),
    joinWith({
      user: analytic => this.userService.valueChanges(analytic.meta.uid)
    }, { shouldAwait: true }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  orgActivity$ = this.titleAnalytics$.pipe(
    map(analytics => counter(analytics, 'org.activity', 'orgActivity'))
  );

  territoryActivity$ = this.titleAnalytics$.pipe(
    map(analytics => counter(analytics, 'org.addresses.main.country', 'territories')),
  );

  buyerAnalytics$ = this.titleAnalytics$.pipe(
    map(aggregatePerUser)
  )

  filters = {
    orgActivity: getFilter('orgActivity')
  };
  filterValue?: string;

  constructor(
    private movieService: MovieService,
    private route: ActivatedRoute,
    private analyticsService: AnalyticsService,
    private userService: UserService,
    private navService: NavigationService
  ) {}

  goBack() {
    this.navService.goBack(1);
  }

  inWishlist(data: AggregatedAnalytic) {
    return data.addedToWishlist > data.removedFromWishlist;
  }
}