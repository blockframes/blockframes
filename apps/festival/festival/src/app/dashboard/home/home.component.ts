// Angular
import { Component, ChangeDetectionStrategy, Optional, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Blockframes
import { fromOrgAndAccepted, MovieService, fromOrg } from '@blockframes/movie/+state/movie.service';
import { OrganizationService } from '@blockframes/organization/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { APP } from '@blockframes/utils/routes/utils';
import { AnalyticsService } from '@blockframes/analytics/+state/analytics.service';
import {
  EventName,
  hasAppStatus,
  App,
  AggregatedAnalytic,
  isMovieAccepted,
  Screening,
  InvitationWithScreening,
  InvitationWithAnalytics,
  Analytics
} from '@blockframes/model';
import { counter } from '@blockframes/analytics/+state/utils';
import { aggregate } from '@blockframes/analytics/+state/utils';
import { UserService } from '@blockframes/user/+state';
import { downloadCsvFromJson, unique } from '@blockframes/utils/helpers';
import { InvitationService } from '@blockframes/invitation/+state';
import { EventService } from '@blockframes/event/+state';
import { MetricCard } from '@blockframes/analytics/components/metric-card-list/metric-card-list.component';

// RxJs
import { map, switchMap, shareReplay, tap, filter, toArray, first } from 'rxjs/operators';
import { combineLatest, firstValueFrom, from, Observable, of } from 'rxjs';

// Intercom
import { Intercom } from 'ng-intercom';
import { sum } from "@blockframes/model";

// NgFire
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
  selector: 'dashboard-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  public selectedCountry?: string;
  public titles$ = this.orgService.currentOrg$.pipe(
    switchMap(({ id }) => this.movieService.valueChanges(fromOrg(id))),
    map((titles) => titles.filter((title) => title.app[this.app].access)),
    tap(titles => {
      titles.filter(hasAppStatus(this.app, ['accepted', 'submitted'])).length
        ? this.dynTitle.setPageTitle('Dashboard')
        : this.dynTitle.setPageTitle('Dashboard', 'Empty');
    })
  );

  titleAnalytics$ = this.analyticsService.getTitleAnalytics().pipe(
    joinWith({
      org: analytic => this.orgService.valueChanges(analytic.meta.orgId)
    }, { shouldAwait: true }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  popularTitle$ = this.titleAnalytics$.pipe(
    filter(analytics => analytics.length > 0),
    map(analytics => counter(analytics, 'meta.titleId')),
    map(analytics => analytics.sort((a, b) => a.count > b.count ? -1 : 1)),
    switchMap(([popularEvent]) => this.movieService.valueChanges(popularEvent.key))
  );

  private titleAnalyticsOfPopularTitle$ = combineLatest([this.popularTitle$, this.titleAnalytics$]).pipe(
    map(([title, titleAnalytics]) => titleAnalytics.filter(analytics => analytics.meta.titleId === title.id)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  orgActivityOfPopularTitle$ = this.titleAnalyticsOfPopularTitle$.pipe(
    map(analytics => counter(analytics, 'org.activity', 'orgActivity')),
  );

  territoryActivityOfPopularTitle$ = this.titleAnalyticsOfPopularTitle$.pipe(
    map(analytics => counter(analytics, 'org.addresses.main.country', 'territories')),
  );

  interactionsOfPopularTitle$ = this.titleAnalyticsOfPopularTitle$.pipe(
    map(analytics => analytics.filter(analytic => analytic.name !== 'pageView'))
  );

  pageViewsOfPopularTitle$ = this.titleAnalyticsOfPopularTitle$.pipe(
    map(analytics => analytics.filter(analytic => analytic.name === 'pageView'))
  );

  activeCountries$ = this.titleAnalytics$.pipe(
    map(analytics => counter(analytics, 'org.addresses.main.country', 'territories')),
  );

  activeBuyers$ = this.titleAnalytics$.pipe(
    filter(analytics => analytics.length > 0),
    map(analytics => {
      const uids = unique(analytics.map(analytic => analytic.meta.uid));
      const orgIds = unique(analytics.map(analytic => analytic.meta.orgId));
      return { uids, orgIds, analytics };
    }),
    joinWith({
      users: ({ uids }) => this.userService.valueChanges(uids),
      orgs: ({ orgIds }) => this.orgService.valueChanges(orgIds)
    }, { shouldAwait: true }),
    map(({ users, orgs, analytics }) => {
      return users.map(user => {
        const org = orgs.find(o => o.id === user.orgId);
        const analyticsOfUser = analytics.filter(analytic => analytic.meta.uid === user.uid);
        return aggregate(analyticsOfUser, { user, org });
      });
    }),
    map(users => users.sort((userA, userB) => userA.total - userB.total))
  );

  buyerAnalytics$ = this.movieService.valueChanges(fromOrgAndAccepted(this.orgService.org.id, this.app)).pipe(
    joinWith({
      analytics: title => {
        const { userId } = this.route.snapshot.params;
        return this.analyticsService.getTitleAnalytics({ titleId: title.id, uid: userId });
      }
    }, { shouldAwait: true }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  invitations$ = this.invitationWithEventAndUserOrg().pipe(
    map(invitations => invitations.filter(invitation => (invitation.event) && invitation.event.meta.titleId)),
    map(invitations => invitations.filter(invitation => isMovieAccepted(invitation.event.movie, this.app))),
    joinWith({
      analytics: (invitation: InvitationWithScreening) => this.getAnalyticsPerInvitation(invitation)
    }, { shouldAwait: true }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  ongoingScreenings$ = this.invitations$.pipe(
    map(
      invitations => invitations.filter(
        invitation => invitation.event.end > new Date()
      )
    ),
    filter(invitations => !!invitations.length),
  );

  screeningRequests$ = this.buyerAnalytics$.pipe(
    map(movieWithAnalytics => {
      return movieWithAnalytics.flatMap(
        ({ analytics }) => analytics
      )
    }),
    map(analytics => {
      return analytics.filter(
        analytic => analytic.name === 'screeningRequested'
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  aggregatedScreeningCards$: Observable<MetricCard[]> = combineLatest([
    this.screeningRequests$,
    this.invitations$
  ]).pipe(
    map(([requests, invitations]) => toScreenerCards(requests, invitations))
  );


  interactions: EventName[] = [
    'addedToWishlist',
    'askingPriceRequested',
    'promoReelOpened',
    'screeningRequested',
  ];

  constructor(
    private analyticsService: AnalyticsService,
    private movieService: MovieService,
    private orgService: OrganizationService,
    private dynTitle: DynamicTitleService,
    @Optional() private intercom: Intercom,
    private userService: UserService,
    private eventService: EventService,
    @Inject(APP) public app: App,
    private router: Router,
    private route: ActivatedRoute,
    private invitationService: InvitationService,
  ) { }

  public showBuyer(row: AggregatedAnalytic) {
    this.router.navigate([`/c/o/dashboard/home/buyer/${row.user.uid}`], { relativeTo: this.route })
  }

  public openIntercom(): void {
    return this.intercom.show();
  }

  private invitationWithEventAndUserOrg() {
    return this.invitationService.allInvitations$.pipe(
      switchMap(
        invitations => of(...invitations).pipe(
          joinWith(
            {
              event: invitation => this.getEvent(invitation.eventId),
              toUserOrg: invitation => this.getOrg(invitation.toUser.orgId)
            },
            { shouldAwait: true }
          ),
          toArray()
        )
      )
    );
  }

  private getOrg(orgId: string) {
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

  private async getAnalyticsPerInvitation(invitation: InvitationWithScreening) {
    const titleWithAnalytics = await firstValueFrom(this.buyerAnalytics$);
    const title = titleWithAnalytics.find(title => invitation.event.meta.titleId === title.id);
    return title.analytics.filter(analytic => analytic.name === 'screeningRequested');
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
}
