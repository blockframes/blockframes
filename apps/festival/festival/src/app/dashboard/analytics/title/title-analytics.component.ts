import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import {
  AggregatedAnalytic,
  Analytics,
  InvitationWithAnalytics,
  Invitation,
  toLabel,
  isScreening,
  displayName,
  EventName,
  getGuest,
  averageWatchtime,
} from '@blockframes/model';
import { filters } from "@blockframes/ui/list/table/filters";
import { AnalyticsService } from '@blockframes/analytics/service';
import { MovieService } from '@blockframes/movie/service';
import { aggregatePerUser, countedToAnalyticData, counter } from '@blockframes/analytics/utils';
import { UserService } from '@blockframes/user/service';
import { NavigationService } from "@blockframes/ui/navigation.service";
import { downloadCsvFromJson } from "@blockframes/utils/helpers";
import { MetricCard } from "@blockframes/analytics/components/metric-card-list/metric-card-list.component";
import { eventTime } from "@blockframes/event/pipes/event-time.pipe";
import { InvitationService } from "@blockframes/invitation/service";
import { EventService } from "@blockframes/event/service";
import { OrganizationService } from '@blockframes/organization/service';
import { displayPerson } from "@blockframes/utils/pipes";

import { filter, map, pluck, shareReplay, switchMap } from "rxjs/operators";
import { combineLatest, firstValueFrom, Observable, of } from "rxjs";
import { joinWith } from 'ngfire';


function toScreenerCards(screeningRequests: Analytics<'title'>[], invitations: Partial<InvitationWithAnalytics>[]): MetricCard[] {
  const attendees = invitations.filter(invitation => invitation.watchTime);
  const accepted = invitations.filter(invitation => invitation.status === 'accepted');

  const averageWatchTime = averageWatchtime(attendees);
  const parsedTime = `${Math.floor(averageWatchTime / 60)}min ${averageWatchTime % 60}s`;
  const participationRate = Math.round(attendees.length / accepted.length) * 100;
  const acceptationRate = Math.round(accepted.length / invitations.length) * 100;
  const traction = Math.round(screeningRequests.length / invitations.length) * 100;
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
      icon: 'timer'
    },
    {
      title: 'Participation Rate',
      value: invitations.length ? `${participationRate}%` : '-',
      icon: 'front_hand'
    },
    {
      title: 'Acceptation Rate',
      value: invitations.length ? `${acceptationRate}%` : '-',
      icon: 'sentiment_satisfied'
    },
    {
      title: 'Traction Rate',
      value: invitations.length ? `${traction}%` : '-',
      icon: 'magnet_electricity'
    }
  ];
}

function emailFilter(input: string, value: string, invitation: Invitation) {
  const email = getGuest(invitation, 'user')?.email;
  if (!email) return false;
  return email.toLowerCase().includes(input.toLowerCase());
}

function nameFilter(input: string, value: string, invitation: Invitation) {
  const names = displayPerson(getGuest(invitation, 'user'));
  if (!names.length) return false;
  return names.join(' ').toLowerCase().includes(input.toLowerCase());
}

@Component({
  selector: 'festival-title-analytics',
  templateUrl: './title-analytics.component.html',
  styleUrls: ['./title-analytics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleAnalyticsComponent {

  interactions: EventName[] = [
    'addedToWishlist',
    'askingPriceRequested',
    'promoReelOpened',
    'screeningRequested',
  ];

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
    map(analytics => counter(analytics, 'org.activity')),
    map(counted => countedToAnalyticData(counted, 'orgActivity'))
  );

  territoryActivity$ = this.titleAnalytics$.pipe(
    map(analytics => counter(analytics, 'org.addresses.main.country')),
    map(counted => countedToAnalyticData(counted, 'territories'))
  );

  buyerAnalytics$ = this.titleAnalytics$.pipe(
    map(aggregatePerUser)
  );

  filters = {
    name: nameFilter,
    email: emailFilter,
    ...filters
  };
  filterValue?: string;

  invitations$ = this.invitationWithEventAndUserOrg().pipe(
    joinWith({
      analytics: () => this.getAnalyticsPerInvitation()
    }, { shouldAwait: true }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  ongoingScreenings$ = this.invitations$.pipe(
    map(invitations => invitations.filter(({ event }) => eventTime(event) === 'onTime')),
    filter(invitations => !!invitations.length),
  );

  screeningRequests$ = this.titleAnalytics$.pipe(
    map(analytics => analytics.filter(analytic => analytic.name === 'screeningRequested')),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  aggregatedScreeningCards$ = combineLatest([
    this.screeningRequests$,
    this.invitations$
  ]).pipe(
    map(([requests, invitations]) => toScreenerCards(requests, invitations))
  );

  titleInteractions$ = this.titleAnalytics$.pipe(
    map(analytics => analytics.filter(analytic => analytic.name !== 'pageView'))
  );


  constructor(
    private movieService: MovieService,
    private route: ActivatedRoute,
    private router: Router,
    private analyticsService: AnalyticsService,
    private userService: UserService,
    private orgService: OrganizationService,
    private navService: NavigationService,
    private eventService: EventService,
    private invitationService: InvitationService,
  ) { }

  goBack() {
    this.navService.goBack(1);
  }

  inWishlist(data: AggregatedAnalytic) {
    return data.addedToWishlist > data.removedFromWishlist;
  }

  private getAnalyticsPerInvitation() {
    return this.titleAnalytics$.pipe(
      map(analytics => {
        return analytics.filter(analytic => analytic.name === 'screeningRequested')
      })
    );
  }

  async exportScreenerAnalytics() {
    const data = await firstValueFrom(this.invitations$);
    const analytics = data.map(invitation => {
      const activity = invitation.guestOrg?.activity;
      const country = invitation.guestOrg?.addresses?.main?.country;
      const user = getGuest(invitation, 'user');
      const name = displayName(user);
      return {
        'Name': name,
        'Email': user.email,
        'Company Name': invitation.guestOrg?.name ?? '-',
        'Activity': activity ? toLabel(activity, 'orgActivity') : '-',
        'Country': country ? toLabel(country, 'territories') : '-',
        'Watchtime': `${invitation.watchTime ?? 0}s`
      }
    });
    downloadCsvFromJson(analytics, 'screener-analytics')
  }


  private invitationWithEventAndUserOrg() {
    return combineLatest([
      this.titleId$,
      this.invitationService.allInvitations$.pipe(
        map(invitations => invitations.filter(invitation => !!invitation.eventId)),
        joinWith(
          {
            guestOrg: invitation => this.getOrg(invitation),
            event: invitation => this.eventService.queryDocs(invitation.eventId)
          },
          { shouldAwait: true }
        )
      )
    ]).pipe(
      map(([titleId, invitations]) => {
        return invitations.filter(({ event }) => {
          const isEventScreening = isScreening(event);
          if (!isEventScreening) return false;
          return event.meta?.titleId === titleId;
        });
      })
    );
  }

  private getOrg(invitation: Invitation) {
    const orgId = getGuest(invitation, 'user').orgId;
    return orgId ? this.orgService.valueChanges(orgId) : of(undefined);
  }

  public viewBuyerActivity(analytic: AggregatedAnalytic) {
    this.router.navigate(
      [`../../buyer/`, analytic.user.uid],
      { relativeTo: this.route }
    );
  }
}
