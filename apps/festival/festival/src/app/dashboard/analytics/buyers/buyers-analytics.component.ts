import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnalyticsService } from '@blockframes/analytics/service';
import { aggregate, countedToAnalyticData, counter, deletedUserIdentifier, toCards } from '@blockframes/analytics/utils';
import { AggregatedAnalytic, App, Organization, Analytics, User, createUser } from '@blockframes/model';
import { fromOrgAndAccessible, MovieService } from '@blockframes/movie/service';
import { OrganizationService } from '@blockframes/organization/service';
import { UserService } from '@blockframes/user/service';
import { unique } from '@blockframes/utils/helpers';
import { APP } from '@blockframes/utils/routes/utils';

import { joinWith } from 'ngfire';
import { combineLatest, firstValueFrom } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'festival-buyers-analytics',
  templateUrl: './buyers-analytics.component.html',
  styleUrls: ['./buyers-analytics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuyersAnalyticsComponent {

  // The analytics of each buyer who interacted with sellers' title
  private analyticsWithUsersAndOrgs$ = this.titleService.valueChanges(fromOrgAndAccessible(this.orgService.org.id, this.app)).pipe(
    joinWith({
      analytics: title => this.analytics.getTitleAnalytics({ titleId: title.id }),
    }, { shouldAwait: true }),
    map(titles => {
      const analytics = titles.map(title => title.analytics).flat();
      const uids = unique(analytics.map(analytic => analytic.meta.uid));
      const orgIds = unique(analytics.map(analytic => analytic.meta.orgId));
      return { uids, orgIds, analytics };
    }),
    joinWith({
      users: ({ uids }) => this.userService.load(uids),
      orgs: ({ orgIds }) => this.orgService.load(orgIds)
    }, { shouldAwait: true }),
    map(({ uids, users, ...rest }) => ({
      users: uids.map(uid => users.filter(u => !!u).find(u => u.uid === uid) || createUser({ uid, lastName: deletedUserIdentifier })),
      ...rest
    })),
    map(({ orgs, analytics, users, ...rest }) => {
      const filteredData = this.removeSellerData(orgs, analytics, users);
      return { ...rest, ...filteredData };
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private buyerOrgAnalytics$ = this.analytics.getOrganizationAnalytics().pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );

  buyersAnalytics$ = combineLatest([this.analyticsWithUsersAndOrgs$, this.buyerOrgAnalytics$]).pipe(
    map(([{ users, orgs, analytics }, organization]) => {
      return users.map(user => {
        const org = orgs.find(o => o.id === user.orgId);
        const analyticsOfUser = analytics.filter(analytic => analytic.meta.uid === user.uid);
        const mainData = aggregate(analyticsOfUser, { user, org });
        const { pageView: orgPageViews } = aggregate(organization.filter(a => a.name === 'pageView' && a.meta.uid === user.uid)); // TODO #9124
        // TODO #9158 mainData.interactions.global.count += orgPageViews; for pie orgActivity 
        return { ...mainData, orgPageViews };
      });
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  orgActivity$ = firstValueFrom(this.buyersAnalytics$.pipe(
    map(aggregated => counter(aggregated, 'org.activity', (item: AggregatedAnalytic) => item.interactions.global.count)),
    map(counted => countedToAnalyticData(counted, 'orgActivity'))
  ));

  aggregatedCards$ = firstValueFrom(combineLatest([this.analyticsWithUsersAndOrgs$, this.buyerOrgAnalytics$]).pipe(
    map(([{ analytics }, organization]) => {
      const { pageView: orgPageViews } = aggregate(organization.filter(a => a.type === 'organization' && a.name === 'pageView'));  // TODO #9124
      return { ...aggregate(analytics.filter(a => a.type === 'title')), orgPageViews };
    }),
    map(toCards)
  ));

  constructor(
    private analytics: AnalyticsService,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: MovieService,
    private userService: UserService,
    private orgService: OrganizationService,
    @Inject(APP) public app: App
  ) { }

  private removeSellerData(orgs: Organization[], analytics: Analytics<'title'>[], users: User[]) {
    const buyerOrg = orgs.filter(org => org && !org.appAccess.festival.dashboard);
    const buyerOrgIds = buyerOrg.map(({ id }) => id);
    const buyerAnalytics = analytics.filter(({ meta }) => buyerOrgIds.includes(meta.orgId));
    const buyerUsers = buyerAnalytics.map(({ meta }) => meta.uid);
    const filteredUsers = users.filter(({ uid }) => buyerUsers.includes(uid));
    return { users: filteredUsers, orgs: buyerOrg, analytics: buyerAnalytics };
  }

  goToBuyer(data: AggregatedAnalytic) {
    if (data.user.lastName !== deletedUserIdentifier) {
      this.router.navigate([data.user.uid], { relativeTo: this.route });
    }
  }
}
