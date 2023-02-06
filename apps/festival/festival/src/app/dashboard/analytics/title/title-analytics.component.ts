import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  AggregatedAnalytic,
  Invitation,
  toLabel,
  isScreening,
  displayName,
  EventName,
  getGuest,
  invitationStatus,
  isBuyer,
} from '@blockframes/model';
import { filters } from '@blockframes/ui/list/table/filters';
import { AnalyticsService } from '@blockframes/analytics/service';
import { MovieService } from '@blockframes/movie/service';
import { aggregatePerUser, countedToAnalyticData, counter, deletedUserIdentifier, oneAnalyticsPerUser } from '@blockframes/analytics/utils';
import { UserService } from '@blockframes/user/service';
import { NavigationService } from '@blockframes/ui/navigation.service';
import { convertToTimeString, downloadCsvFromJson } from '@blockframes/utils/helpers';
import { toScreenerCards } from '@blockframes/analytics/utils';
import { eventTime } from '@blockframes/event/pipes/event-time.pipe';
import { InvitationService } from '@blockframes/invitation/service';
import { EventService } from '@blockframes/event/service';
import { OrganizationService } from '@blockframes/organization/service';
import { displayPerson } from '@blockframes/utils/pipes';

import { combineLatest, firstValueFrom, Observable, of, filter, map, pluck, shareReplay, switchMap } from 'rxjs';
import { joinWith } from 'ngfire';
import { formatDate } from '@angular/common';
import { where } from 'firebase/firestore';

function emailFilter(input: string, _: string, invitation: Invitation) {
  const email = getGuest(invitation, 'user')?.email;
  if (!email) return false;
  return email.toLowerCase().includes(input.toLowerCase());
}

function nameFilter(input: string, _: string, invitation: Invitation) {
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
    'promoElementOpened',
    'screeningRequested',
  ];

  private titleId$ = this.route.params.pipe(
    pluck('titleId')
  ) as Observable<string>;

  title$ = firstValueFrom(this.titleId$.pipe(
    switchMap((titleId: string) => this.movieService.valueChanges(titleId)),
    shareReplay({ bufferSize: 1, refCount: true })
  ));

  titleAnalytics$ = this.titleId$.pipe(
    switchMap((titleId: string) => this.analyticsService.getTitleAnalytics({ titleId })),
    joinWith({
      org: analytic => this.orgService.valueChanges(analytic.meta.orgId),
      user: analytic => this.userService.valueChanges(analytic.meta.uid)
    }, { shouldAwait: true }),
    map(analyticsWithOrg => analyticsWithOrg.filter(({ org }) => isBuyer(org))),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  orgActivity$ = firstValueFrom(this.titleAnalytics$.pipe(
    map(analytics => counter(oneAnalyticsPerUser(analytics), 'org.activity')),
    map(counted => countedToAnalyticData(counted, 'orgActivity'))
  ));

  territoryActivity$ = firstValueFrom(this.titleAnalytics$.pipe(
    map(analytics => counter(oneAnalyticsPerUser(analytics), 'org.addresses.main.country')),
    map(counted => countedToAnalyticData(counted, 'territories'))
  ));

  buyerAnalytics$ = firstValueFrom(this.titleAnalytics$.pipe(
    map(aggregatePerUser)
  ));

  filters = {
    name: nameFilter,
    email: emailFilter,
    ...filters
  };
  filterValue?: string;

  invitations$ = combineLatest([
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
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  ongoingScreenings$ = firstValueFrom(this.invitations$.pipe(
    map(invitations => invitations.filter(({ event }) => eventTime(event) === 'onTime')),
    filter(invitations => !!invitations.length),
  ));

  aggregatedScreeningCards$ = firstValueFrom(this.invitations$.pipe(
    map(invitations => toScreenerCards(invitations))
  ));

  titleInteractions$ = firstValueFrom(this.titleAnalytics$.pipe(
    map(analytics => analytics.filter(analytic => analytic.name !== 'pageView'))
  ));

  endedOrOngoingScreenings$ = firstValueFrom(this.titleId$.pipe(
    switchMap((titleId: string) => this.eventService.valueChanges([
      where('meta.titleId', '==', titleId),
      where('ownerOrgId', '==', this.orgService.org.id),
      where('type', '==', 'screening')
    ])),
    map(events => events.filter(e => eventTime(e) !== 'early'))
  ));

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
        'Invitation': invitationStatus[invitation.status],
        'Watch Time': invitation.watchInfos?.duration !== undefined ? convertToTimeString(invitation.watchInfos?.duration * 1000) : '-',
        'Watching Ended': invitation.watchInfos?.date ? formatDate(invitation.watchInfos?.date, 'MM/dd/yyyy HH:mm', 'en') : '-'
      }
    });
    downloadCsvFromJson(analytics, 'screener-analytics')
  }

  private getOrg(invitation: Invitation) {
    const orgId = getGuest(invitation, 'user').orgId;
    return orgId ? this.orgService.valueChanges(orgId) : of(undefined);
  }

  public viewBuyerActivity(analytic: AggregatedAnalytic) {
    if (analytic.user.lastName !== deletedUserIdentifier) {
      this.router.navigate([`../../buyer/`, analytic.user.uid], { relativeTo: this.route });
    }
  }
}
