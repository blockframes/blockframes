import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { APP } from '@blockframes/utils/routes/utils';
import {
  AggregatedAnalytic,
  Analytics,
  sum,
  Screening,
  InvitationWithAnalytics,
  Invitation,
  App,
  Event,
  Organization,
} from '@blockframes/model';
import { getStaticModelFilter } from "@blockframes/ui/list/table/filters";
import { AnalyticsService } from '@blockframes/analytics/service';
import { MovieService } from '@blockframes/movie/service';
import { aggregatePerUser, counter } from '@blockframes/analytics/utils';
import { UserService } from '@blockframes/user/service';
import { NavigationService } from "@blockframes/ui/navigation.service";
import { downloadCsvFromJson } from "@blockframes/utils/helpers";
import { MetricCard } from "@blockframes/analytics/components/metric-card-list/metric-card-list.component";
import { eventTime } from "@blockframes/event/pipes/event-time.pipe";
import { getGuest } from "@blockframes/invitation/pipes/guest.pipe";
import { InvitationService } from "@blockframes/invitation/service";
import { EventService } from "@blockframes/event/service";
import { filter, map, pluck, shareReplay, switchMap } from "rxjs/operators";
import { OrganizationService } from '@blockframes/organization/service';
import { combineLatest, EMPTY, firstValueFrom, from, Observable, of } from "rxjs";
import { joinWith } from 'ngfire';


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
    joinWith({
      analytics: () => this.getAnalyticsPerInvitation()
    }, { shouldAwait: true }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  ongoingScreenings$ = this.invitations$.pipe(
    map(events => events.filter(({ event }) => eventTime(event) === 'onTime')),
    filter(events => !!events.length),
  );

  screeningRequests$ = this.titleAnalytics$.pipe(
    map(analytics => analytics.filter(analytic => analytic.name === 'screeningRequested')),
    shareReplay({ bufferSize: 1, refCount: true })
  );


  aggregatedScreeningCards$: Observable<MetricCard[]> = combineLatest([
    this.screeningRequests$,
    this.invitations$
  ]).pipe(
    map(([requests, invitations]) => {
      return toScreenerCards(requests, invitations);
    })
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

  private async getAnalyticsPerInvitation() {
    const titleAnalytics = await firstValueFrom(this.titleAnalytics$);
    return titleAnalytics.filter(analytic => analytic.name === 'screeningRequested');
  }

  async exportScreenerAnalytics() {
    const data = await firstValueFrom(this.invitations$);
    const analytics = data.map(invitation => ({
      'Name': `${invitation.toUser.firstName} ${invitation.toUser.lastName}`,
      'Email': invitation.toUser.email,
      'Company Name': invitation.guestOrg.denomination?.public ?? '--',
      'Activity': invitation.guestOrg.activity ?? '--',
      'Country': invitation.guestOrg.addresses?.main?.country ?? '--',
      'Watchtime': `${invitation.watchTime ?? 0}s`
    }));
    downloadCsvFromJson(analytics, 'screener-analytics')
  }


  private invitationWithEventAndUserOrg() {
    return combineLatest([
      this.titleId$,
      this.invitationService.allInvitations$.pipe(
        joinWith(
          {
            guestOrg: invitation => this.getOrg(invitation),
            event: invitation => this.getEvent(invitation)
          },
          { shouldAwait: true }
        )
      )
    ]).pipe(
      map(([titleId, invitations]) => {
        return invitations.filter(({ event }) => {
          const isScreening = event.type === 'screening';
          const eventIsOfTitle = event.meta.titleId === titleId;
          return isScreening && eventIsOfTitle;
        })
      })
    )
  }

  private getOrg(invitation: Invitation) {
    const orgId = getGuest(invitation, 'user').orgId;
    if (orgId) return from(this.orgService.getValue(orgId))
    return of({} as Organization);
  }

  private getEvent(invitation: Invitation) {
    if (!invitation.eventId) return EMPTY as Observable<Event<Screening>>;
    return this.eventService.queryDocs<Screening>(invitation.eventId)
  }
}
