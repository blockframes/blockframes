import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AnalyticsService } from "@blockframes/analytics/+state/analytics.service";
import { aggregate } from "@blockframes/analytics/+state/utils";
import { AggregatedAnalytic, EventName } from "@blockframes/model";
import { MovieService } from "@blockframes/movie/+state/movie.service";
import { OrganizationService } from "@blockframes/organization/+state";
import { IconSvg } from "@blockframes/ui/icon.service";
import { NavigationService } from "@blockframes/ui/navigation.service";
import { UserService } from "@blockframes/user/+state";
import { App } from "@blockframes/utils/apps";
import { joinWith } from "@blockframes/utils/operators";
import { APP } from "@blockframes/utils/routes/utils";
import { combineLatest, map, Observable, pluck, shareReplay, switchMap } from "rxjs";

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

  buyerAnalytics$ = this.titleService.queryDashboard(this.app).pipe(
    joinWith({
      analytics: title => {
        const { userId } = this.route.snapshot.params;
        return this.analytics.getTitleAnalytics({ titleId: title.id, uid: userId });
      }
    }, { shouldAwait: true }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  aggregated$ = this.buyerAnalytics$.pipe(
    map(titles => titles.map(title => title.analytics).flat()),
    map(analytics => aggregate(analytics))
  );

  aggregatedPerTitle$ = this.buyerAnalytics$.pipe(
    map(titles => titles.map(title => aggregate(title.analytics, { title })))
  );

  events: { name: EventName, title: string, icon: IconSvg }[] = [
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
  ]

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
}