import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { APP } from '@blockframes/utils/routes/utils';
import {
  AggregatedAnalytic,
  Analytics,
  sum,
  isMovieAccepted,
  Screening,
  InvitationWithScreening,
  InvitationWithAnalytics,
  Invitation,
  App,
} from '@blockframes/model';
import { getStaticModelFilter } from "@blockframes/ui/list/table/filters";
import { AnalyticsService } from '@blockframes/analytics/+state/analytics.service';
import { MovieService } from '@blockframes/movie/service';
import { joinWith } from 'ngfire';
import { filter, first, map, pluck, shareReplay, switchMap } from "rxjs/operators";
import { aggregatePerUser, counter } from '@blockframes/analytics/+state/utils';
import { UserService } from '@blockframes/user/service';
import { NavigationService } from "@blockframes/ui/navigation.service";
import { OrganizationService } from '@blockframes/organization/service';
import { combineLatest, firstValueFrom, from, Observable, of } from "rxjs";
import { downloadCsvFromJson } from "@blockframes/utils/helpers";
import { MetricCard } from "@blockframes/analytics/components/metric-card-list/metric-card-list.component";
import { eventTime } from "@blockframes/event/pipes/event-time.pipe";
import { getGuest } from "@blockframes/invitation/pipes/guest.pipe";
import { EventService } from "@blockframes/event/+state";
import { InvitationService } from "@blockframes/invitation/+state";

function toScreenerCards(screeningRequests: Analytics<'title'>[], invitations: Partial<InvitationWithAnalytics>[]): MetricCard[] {
  const attendees = invitations.filter(invitation => invitation.watchTime);
  const accepted = invitations.filter(invitation => invitation.status === 'accepted');
  const participationRate = Math.round(attendees.length / invitations.length) * 100;
  const acceptationRate = Math.round(accepted.length / invitations.length) * 100;
  const averageWatchTime = sum(attendees, inv => inv.watchTime) / invitations.length || 0
  const parsedTime = `${Math.floor(averageWatchTime / 60)} min ${averageWatchTime % 60} s`
  const traction = Math.round(screeningRequests.length / (invitations.length + screeningRequests.length)) * 100;
  return [
    {
      title: 'Guests',
      value: invitations.length,
      icon: 'badge'
    },
    {
      title: 'Attendees',
      value: attendees.length,
      icon: 'group'
    },
    {
      title: 'Average watch time',
      value: parsedTime,
      icon: 'stop_watch'
    },
    {
      title: 'Participation Rate',
      value: `${participationRate}%`,
      icon: 'hand'
    },
    {
      title: 'Acceptation Rate',
      value: `${acceptationRate}%`,
      icon: 'smiley'
    },
    {
      title: 'Traction Rate',
      value: `${traction}%`,
      icon: 'magnet_electricity'
    }
  ];
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
  ) as Observable<string>;

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
    orgActivity: getStaticModelFilter('orgActivity'),
    territories: getStaticModelFilter('territories')
  };
  filterValue?: string;

  invitations$ = this.invitationWithEventAndUserOrg().pipe(
    map(invitations => invitations.filter(invitation => (invitation.event) && invitation?.event?.meta?.titleId)),
    map(invitations => invitations.filter(invitation => isMovieAccepted(invitation?.event?.movie, this.app))),
    joinWith({
      analytics: (invitation: InvitationWithScreening) => this.getAnalyticsPerInvitation(invitation)
    }, { shouldAwait: true }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  ongoingScreenings$ = this.invitations$.pipe(
    map(
      invitations => invitations.filter(
        invitation => eventTime(invitation.event) === 'onTime'
      )
    ),
    filter(invitations => !!invitations.length),
  );

  screeningRequests$ = this.titleAnalytics$.pipe(
    map(analytics => analytics.filter(analytic => analytic.name === 'screeningRequested')),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  aggregatedScreeningCards$: Observable<MetricCard[]> = combineLatest([
    this.screeningRequests$,
    this.invitations$
  ]).pipe(
    map(([requests, invitations]) => toScreenerCards(requests, invitations))
  );


  constructor(
    private movieService: MovieService,
    private route: ActivatedRoute,
    private analyticsService: AnalyticsService,
    private userService: UserService,
    private orgService: OrganizationService,
    private navService: NavigationService,
    private eventService: EventService,
    private invitationService: InvitationService,
    @Inject(APP) public app: App,
  ) { }

  goBack() {
    this.navService.goBack(1);
  }

  inWishlist(data: AggregatedAnalytic) {
    return data.addedToWishlist > data.removedFromWishlist;
  }

  private async getAnalyticsPerInvitation(invitation: InvitationWithScreening) {
    const titleAnalytics = await firstValueFrom(this.titleAnalytics$);
    return titleAnalytics.filter(analytic => analytic.name === 'screeningRequested');
  }

  async exportScreenerAnalytics() {
    const data = await firstValueFrom(this.invitations$);
    const analytics = data.map(invitation => ({
      'Name': `${invitation.toUser.firstName} ${invitation.toUser.lastName}`,
      'Email': invitation.toUser.email,
      'Company Name': invitation.toUserOrg.denomination.public,
      'Activity': invitation.toUserOrg.activity,
    }));
    downloadCsvFromJson(analytics, 'screener-analytics')
  }

  private invitationWithEventAndUserOrg() {
    return this.invitationService.allInvitations$.pipe(
      joinWith(
        {
          event: invitation => this.getEvent(invitation.eventId),
          toUserOrg: invitation => this.getOrg(invitation)
        },
        { shouldAwait: true }
      )
    );
  }

  private getOrg(invitation: Invitation) {
    const orgId = getGuest(invitation, 'user').orgId;
    const externalOrg = {
      denomination: { public: 'External' },
      activity: '--'
    };
    if (orgId) return from(this.orgService.getValue(orgId));
    return of(externalOrg);
  }

  private getEvent(eventId: string) {
    return this.eventService.queryDocs<Screening>(eventId)
      .pipe(first())
  }

}
