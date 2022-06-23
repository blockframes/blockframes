import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toCards } from '@blockframes/analytics/components/metric-card-list/metric-card-list.component';
import { AnalyticsService } from '@blockframes/analytics/service';
import { aggregate, countedToAnalyticData, counter } from '@blockframes/analytics/utils';
import { AggregatedAnalytic, App, Organization, Analytics, User } from '@blockframes/model';
import { fromOrgAndAccepted, MovieService } from '@blockframes/movie/service';
import { OrganizationService } from '@blockframes/organization/service';
import { UserService } from '@blockframes/user/service';
import { unique } from '@blockframes/utils/helpers';
import { APP } from '@blockframes/utils/routes/utils';

import { joinWith } from 'ngfire';
import { map, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'festival-buyers-analytics',
  templateUrl: './buyers-analytics.component.html',
  styleUrls: ['./buyers-analytics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuyersAnalyticsComponent {

  // The analytics of each buyer who interacted with sellers' title
  private analyticsWithUsersAndOrgs$ = this.titleService.valueChanges(fromOrgAndAccepted(this.orgService.org.id, this.app)).pipe(
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
      users: ({ uids }) => this.userService.valueChanges(uids),
      orgs: ({ orgIds }) => this.orgService.valueChanges(orgIds)
    }, { shouldAwait: true }),
    map(({ orgs, analytics, users, ...rest }) => {
      const filteredData = this.removeSellerData(orgs, analytics, users,);
      return { ...rest, ...filteredData };
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  buyersAnalytics$ = this.analyticsWithUsersAndOrgs$.pipe(
    map(({ users, orgs, analytics }) => {
      return users.map(user => {
        const org = orgs.find(o => o.id === user.orgId);
        const analyticsOfUser = analytics.filter(analytic => analytic.meta.uid === user.uid);
        return aggregate(analyticsOfUser, { user, org });
      });
    })
  );

  orgActivity$ = this.buyersAnalytics$.pipe(
    map(aggregated => counter(aggregated, 'org.activity', (item: AggregatedAnalytic) => item.total)),
    map(counted => countedToAnalyticData(counted, 'orgActivity'))
  )
  aggregatedCards$ = this.analyticsWithUsersAndOrgs$.pipe(
    map(({ analytics }) => aggregate(analytics)),
    map(toCards)
  );

  constructor(
    private analytics: AnalyticsService,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: MovieService,
    private userService: UserService,
    private orgService: OrganizationService,
    @Inject(APP) public app: App
  ) { }

  removeSellerData(orgs: Organization[], analytics: Analytics<"title">[], users: User[]) {
    const buyerOrg = orgs.filter(org => !org.appAccess.festival.dashboard);
    const buyerOrgIds = buyerOrg.map(({ id }) => id);
    const buyerAnalytics = analytics.filter(({ meta }) => buyerOrgIds.includes(meta.orgId))
    const buyerUsers = buyerAnalytics.map(({ meta }) => meta.uid);
    const filteredUsers = users.filter(({ uid }) => buyerUsers.includes(uid));
    return { users: filteredUsers, orgs: buyerOrg, analytics: buyerAnalytics };
  }

  goToBuyer(data: AggregatedAnalytic) {
    this.router.navigate([data.user.uid], { relativeTo: this.route });
  }
}
