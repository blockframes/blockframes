import {
  InvitationWithScreening,
  InvitationWithAnalytics,
  averageWatchDuration,
} from '@blockframes/model';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnalyticsService } from '@blockframes/analytics/service';
import { aggregate, counter, countedToAnalyticData } from '@blockframes/analytics/utils';
import { MetricCard, events, toCards } from '@blockframes/analytics/components/metric-card-list/metric-card-list.component';
import {
  AggregatedAnalytic,
  isScreening,
  Invitation,
  Analytics,
  isMovieAccepted,
  AnalyticData,
  Movie,
} from '@blockframes/model';
import { fromOrgAndAccepted, MovieService } from '@blockframes/movie/service';
import { OrganizationService } from '@blockframes/organization/service';
import { NavigationService } from '@blockframes/ui/navigation.service';
import { UserService } from '@blockframes/user/service';
import { App, toLabel } from '@blockframes/model';
import { APP } from '@blockframes/utils/routes/utils';
import { convertToTimeString, downloadCsvFromJson } from '@blockframes/utils/helpers';
import { joinWith } from 'ngfire';
import {
  BehaviorSubject,
  combineLatest,
  firstValueFrom,
  map,
  Observable,
  pluck,
  shareReplay,
  switchMap,
} from 'rxjs';
import { InvitationService } from '@blockframes/invitation/service';
import { EventService } from '@blockframes/event/service';
import { scrollIntoView } from "@blockframes/utils/browser/utils";
import { formatDate } from '@angular/common';

interface MovieWithAnalytics extends Movie { analytics: Analytics<'title'>[]; };


function filterAnalytics(title: string, analytics: AggregatedAnalytic[]) {
  const name = events.find(event => event.title === title)?.name;
  return name
    ? analytics.filter(aggregated => aggregated[name] > 0)
    : analytics;
}

function aggregatedToAnalyticData(data: AggregatedAnalytic[]): AnalyticData[] {
  return data.map(({ title, total }) => ({
    key: title.id,
    count: total,
    label: title.title.international ?? title.title.original
  }));
}

function toScreenerCards(invitations: Partial<InvitationWithAnalytics>[]): MetricCard[] {
  const attended = invitations.filter(invitation => invitation.watchInfos?.duration);
  const avgWatchDuration = averageWatchDuration(attended);
  const invitationsCount = invitations.filter(i => i.mode === 'invitation').length;
  const requestsCount = invitations.filter(i => i.mode === 'request').length;

  return [
    {
      title: 'Invitations',
      value: invitationsCount,
      icon: 'badge'
    },
    {
      title: 'Screenings attended',
      value: attended.length,
      icon: 'movie'
    },
    {
      title: 'Requests',
      value: requestsCount,
      icon: 'ask_screening_2'
    },
    {
      title: 'Average Watch Time',
      value: convertToTimeString(avgWatchDuration * 1000),
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
export class BuyerAnalyticsComponent implements AfterViewInit {
  @ViewChild('header') header: ElementRef;
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

  aggregatedPerGenre$ = this.buyerAnalytics$.pipe(
    map(titles => {
      const getDelta = (movie: MovieWithAnalytics) => movie.analytics.length;
      return counter(titles, 'genres', getDelta)
    }),
    map(counted => countedToAnalyticData(counted, 'genres'))
  )

  private aggregatedPerTitle$ = this.buyerAnalytics$.pipe(
    map(titles => titles.map(title => aggregate(title.analytics, { title }))),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  totalAnalyticsPerTitle$ = this.aggregatedPerTitle$.pipe(
    map(aggregatedToAnalyticData),
    map(analyticData => {
      const sorted = analyticData.sort((a, b) => b.count - a.count);
      return sorted.splice(0, 5); // only show top 5
    }),
  );

  filter$ = new BehaviorSubject('');
  filtered$ = combineLatest([
    this.filter$.asObservable(),
    this.aggregatedPerTitle$.pipe(
      map(aggregated => aggregated.filter(a => a.total > 0))
    )
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

  hasInvitations$ = this.invitations$.pipe(
    map(invitations => invitations.length)
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

  ngAfterViewInit(): void {
    setTimeout(() => {
      scrollIntoView(this.header.nativeElement);
    });
  }

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
      //#8693 Currently we rename on the ui from promo reels/elements to video plays.
      //This should be reverted to promo elements once above issue is resolved.
      'Video Plays': aggregated.promoReelOpened,
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
      'Watch Time': convertToTimeString(invitation.watchInfos?.duration * 1000),
      'Watching Ended': invitation.watchInfos?.date ? formatDate(invitation.watchInfos?.date, 'MM/dd/yyyy HH:mm', 'en') : '-'
    }));
    downloadCsvFromJson(analytics, 'buyer-screener-analytics')
  }

  private async getAnalyticsPerInvitation(invitation: InvitationWithScreening) {
    const titleWithAnalytics = await firstValueFrom(this.buyerAnalytics$);
    const title = titleWithAnalytics.find(title => invitation.event.meta.titleId === title.id);
    return title.analytics.filter(analytic => analytic.name === 'screeningRequested');
  }
}
