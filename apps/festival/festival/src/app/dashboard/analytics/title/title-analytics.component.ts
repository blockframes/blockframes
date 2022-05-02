import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AggregatedAnalytic, Analytics, createAggregatedAnalytic, Organization, User, Scope, staticModel } from '@blockframes/model';
import { AnalyticsService } from '@blockframes/analytics/+state/analytics.service';
import { MovieService } from "@blockframes/movie/+state/movie.service";
import { joinWith } from 'ngfire';
import { map, pluck, shareReplay, switchMap } from "rxjs/operators";
import { aggregatePerUser, counter } from '@blockframes/analytics/+state/utils';
import { UserService } from "@blockframes/user/+state";
import { NavigationService } from "@blockframes/ui/navigation.service";
import { OrganizationService } from "@blockframes/organization/+state";

function getFilter(scope: Scope) {
  return (input: string, value: any) => {
    if (typeof value !== 'string') return false;
    const label = staticModel[scope][value];
    return label.toLowerCase().includes(input);
  };
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
    switchMap((titleId: string) => this.analyticsService.getTitleAnalytics({ titleId })),
    joinWith({
      org: analytic => this.orgService.valueChanges(analytic.meta.orgId),
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
  );

  filters = {
    orgActivity: getFilter('orgActivity'),
    territories: getFilter('territories')
  };
  filterValue?: string;

  constructor(
    private movieService: MovieService,
    private route: ActivatedRoute,
    private analyticsService: AnalyticsService,
    private userService: UserService,
    private orgService: OrganizationService,
    private navService: NavigationService
  ) {}

  goBack() {
    this.navService.goBack(1);
  }

  inWishlist(data: AggregatedAnalytic) {
    return data.addedToWishlist > data.removedFromWishlist;
  }
}