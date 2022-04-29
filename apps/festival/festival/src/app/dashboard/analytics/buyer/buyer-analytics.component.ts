import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AnalyticsService } from "@blockframes/analytics/+state/analytics.service";
import { aggregate } from "@blockframes/analytics/+state/utils";
import { MetricCard } from "@blockframes/analytics/components/metric-card-list/metric-card-list.component";
import { AggregatedAnalytic, EventName } from "@blockframes/model";
import { fromOrgAndAccepted, MovieService } from "@blockframes/movie/+state/movie.service";
import { OrganizationService } from "@blockframes/organization/+state";
import { IconSvg } from "@blockframes/ui/icon.service";
import { NavigationService } from "@blockframes/ui/navigation.service";
import { UserService } from "@blockframes/user/+state";
import { App } from "@blockframes/model";
import { joinWith } from "@blockframes/utils/operators";
import { APP } from "@blockframes/utils/routes/utils";
import { downloadCsvFromJson } from "@blockframes/utils/helpers";
import { toLabel } from "@blockframes/utils/utils";
import { 
  BehaviorSubject,
  combineLatest,
  lastValueFrom,
  map,
  Observable,
  pluck,
  shareReplay,
  switchMap,
  take
} from "rxjs";

interface VanityMetricEvent {
  name: EventName;
  title: string;
  icon: IconSvg;
};

const events: VanityMetricEvent[] = [
  {
    name: 'pageView',
    title: 'Views',
    icon: 'visibility'
  },
  {
    name: 'promoReelOpened',
    title: 'Promoreel Opened',
    icon: 'star_fill'
  },
  { 
    name: 'addedToWishlist',
    title: 'Adds to Wishlist',
    icon: 'favorite'
  },
  {
    name: 'screeningRequested',
    title: 'Screening Requested',
    icon: 'ask_screening_2'
  },
  {
    name: 'askingPriceRequested',
    title: 'Asking Price Requested',
    icon: 'local_offer'
  }
];

function toCards(aggregated: AggregatedAnalytic): MetricCard[] {
  return events.map(event => ({
    title: event.title,
    value: aggregated[event.name],
    icon: event.icon,
    selected: false
  }));
}


@Component({
  selector: 'festival-buyer-analytics',
  templateUrl: './buyer-analytics.component.html',
  styleUrls: ['./buyer-analytics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuyerAnalyticsComponent {

  userId$: Observable<string> = this.route.params.pipe(
    pluck('userId')
  );

  user$ = this.userId$.pipe(
    switchMap(userId => this.userService.valueChanges(userId)),
    joinWith({
      org: user => this.orgService.valueChanges(user.orgId)
    }, { shouldAwait: true })
  );

  buyerAnalytics$ = this.titleService.valueChanges(fromOrgAndAccepted(this.orgService.org.id, this.app)).pipe(
    joinWith({
      analytics: title => {
        const { userId } = this.route.snapshot.params;
        return this.analytics.getTitleAnalytics({ titleId: title.id, uid: userId });
      }
    }, { shouldAwait: true }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  aggregatedCards$ = this.buyerAnalytics$.pipe(
    map(titles => titles.map(title => title.analytics).flat()),
    map(analytics => aggregate(analytics)),
    map(toCards)
  );

  private aggregatedPerTitle$ = this.buyerAnalytics$.pipe(
    map(titles => titles.map(title => aggregate(title.analytics, { title })))
  );

  filter$ = new BehaviorSubject('');
  filtered$ = combineLatest([
    this.filter$.asObservable(),
    this.aggregatedPerTitle$
  ]).pipe(
    map(([filter, analytics]) => {
      const key = events.find(event => event.title === filter)?.name;
      return key
        ? analytics.filter(aggregated => aggregated[key] > 0)
        : analytics;
    })
  )

  constructor(
    private analytics: AnalyticsService,
    private navService: NavigationService,
    private orgService: OrganizationService,
    private route: ActivatedRoute,
    private titleService: MovieService,
    private userService: UserService,
    @Inject(APP) public app: App
  ) {}

  goBack() {
    this.navService.goBack(1);
  }

  inWishlist(data: AggregatedAnalytic) {
    return data.addedToWishlist > data.removedFromWishlist;
  }

  async exportAnalytics() {
    const analytics = await lastValueFrom(this.filtered$.pipe(
      take(1),
      map(data => data.map(aggregated => ({
        'Title': aggregated.title.title.international,
        'Release year': aggregated.title.release.year,
        'Countries of Origin': toLabel(aggregated.title.originCountries, 'territories'),
        'Original Languages': toLabel(aggregated.title.originalLanguages, 'languages'),
        'In wishlist': this.inWishlist(aggregated) ? 'Yes' : 'No',
        'Promotional Elements': aggregated.promoReelOpened,
        'Screening Requests': aggregated.screeningRequested,
        'Asking Price Requested': aggregated.askingPriceRequested
      })))
    ));

    downloadCsvFromJson(analytics, 'buyer-analytics');
  }
}