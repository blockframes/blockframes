import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AnalyticsService } from "@blockframes/analytics/+state/analytics.service";
import { aggregate } from "@blockframes/analytics/+state/utils";
import { MetricCard } from "@blockframes/analytics/components/metric-card-list/metric-card-list.component";
import { AggregatedAnalytic, EventName, Event, Screening, isScreening, Invitation, Analytics, isMovieAccepted } from "@blockframes/model";
import { fromOrgAndAccepted, MovieService } from "@blockframes/movie/+state/movie.service";
import { OrganizationService } from "@blockframes/organization/+state";
import { IconSvg } from "@blockframes/ui/icon.service";
import { NavigationService } from "@blockframes/ui/navigation.service";
import { UserService } from "@blockframes/user/+state";
import { App } from "@blockframes/model";
import { APP } from "@blockframes/utils/routes/utils";
import { downloadCsvFromJson } from "@blockframes/utils/helpers";
import { joinWith } from 'ngfire';
import { sum, toLabel } from "@blockframes/model";
import {
  BehaviorSubject,
  combineLatest,
  firstValueFrom,
  map,
  Observable,
  pluck,
  shareReplay,
  switchMap
} from "rxjs";
import { InvitationService } from "@blockframes/invitation/+state";
import { EventService } from "@blockframes/event/+state";

interface InvitationWithScreening extends Invitation {
  event: Event<Screening>;
}

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

function filterAnalytics(title: string, analytics: AggregatedAnalytic[]) {
  const name = events.find(event => event.title === title)?.name;
  return name
    ? analytics.filter(aggregated => aggregated[name] > 0)
    : analytics;
}

interface InvitationWithAnalytics extends Invitation { analytics: Analytics[]; };
function toScreenerCards(invitations: Partial<InvitationWithAnalytics>[]): MetricCard[] {
  const attended = invitations.filter(invitation => invitation.watchTime);
  return [
    {
      title: 'Invitations',
      value: invitations.length,
      icon: 'badge'
    },
    {
      title: 'Screenings attended',
      value: attended.length,
      icon: 'movie'
    },
    {
      title: 'Requests',
      value: sum(invitations, inv => inv.analytics.length),
      icon: 'ask_screening_2'
    },
    {
      title: 'Average watch time',
      value: sum(attended, inv => inv.watchTime) / invitations.length || 0,
      icon: 'access_time'
    }
  ];
}

function fromUser(invitation: Invitation, uid: string) {
  return invitation.fromUser?.uid === uid || invitation.toUser?.uid === uid;
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
    map(([filter, analytics]) => filterAnalytics(filter, analytics))
  );

  invitations$ = combineLatest([
    this.user$,
    this.invitationService.allInvitations$
  ]).pipe(
    map(([user, invitations]) => invitations.filter(invitation => fromUser(invitation, user.uid))),
    joinWith({
      event: invitation => this.eventService.queryDocs(invitation.eventId)
    }, { shouldAwait: true }),
    map(invitations => invitations.filter(invitation => isScreening(invitation.event) && invitation.event.meta.titleId)),
    map(invitations => invitations.filter(invitation => isMovieAccepted(invitation.event.movie, this.app))),
    joinWith({
      analytics: (invitation: InvitationWithScreening) => this.getAnalyticsPerInvitation(invitation)
    }, { shouldAwait: true }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  aggregatedScreeningCards$: Observable<MetricCard[]> = this.invitations$.pipe(
    map(toScreenerCards)
  );

  constructor(
    private analytics: AnalyticsService,
    private eventService: EventService,
    private invitationService: InvitationService,
    private navService: NavigationService,
    private orgService: OrganizationService,
    private route: ActivatedRoute,
    private titleService: MovieService,
    private userService: UserService,
    @Inject(APP) public app: App
  ) { }

  goBack() {
    this.navService.goBack(1);
  }

  inWishlist(data: AggregatedAnalytic) {
    return data.addedToWishlist > data.removedFromWishlist;
  }

  async exportAnalytics() {
    const data = await firstValueFrom(this.filtered$);
    const analytics = data.map(aggregated => ({
      'Title': aggregated.title.title.international,
      'Release year': aggregated.title.release.year,
      'Countries of Origin': toLabel(aggregated.title.originCountries, 'territories'),
      'Original Languages': toLabel(aggregated.title.originalLanguages, 'languages'),
      'In wishlist': this.inWishlist(aggregated) ? 'Yes' : 'No',
      'Promotional Elements': aggregated.promoReelOpened,
      'Screening Requests': aggregated.screeningRequested,
      'Asking Price Requested': aggregated.askingPriceRequested
    }));

    downloadCsvFromJson(analytics, 'buyer-analytics');
  }

  async exportScreenerAnalytics() {
    const data = await firstValueFrom(this.invitations$);
    const analytics = data.map(invitation => ({
      'Title': invitation.event?.movie?.title.international,
      'Invitation': invitation.status,
      'Request to participate': invitation.mode,
      'Screening Requests': invitation.analytics?.length,
      'Watch Time': invitation.watchTime || '0min'
    }));
    downloadCsvFromJson(analytics, 'buyer-screener-analytics')
  }

  private async getAnalyticsPerInvitation(invitation: InvitationWithScreening) {
    const titleWithAnalytics = await firstValueFrom(this.buyerAnalytics$);
    const title = titleWithAnalytics.find(title => invitation.event.meta.titleId === title.id);
    return title.analytics.filter(analytic => analytic.name === 'screeningRequested');
  }
}
