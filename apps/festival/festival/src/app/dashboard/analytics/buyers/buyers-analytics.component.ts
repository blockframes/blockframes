import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnalyticsService } from '@blockframes/analytics/service';
import { countedToAnalyticData, counter, toCards } from '@blockframes/analytics/utils';
import { AggregatedAnalytic, App, createUser, deletedIdentifier, removeSellerData, aggregate } from '@blockframes/model';
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

  private titleAnalytics$ = this.titleService.valueChanges(fromOrgAndAccessible(this.orgService.org.id, this.app)).pipe(
    joinWith({
      analytics: title => this.analytics.getTitleAnalytics({ titleId: title.id }),
    }, { shouldAwait: true }),
    map(titles => titles.map(title => title.analytics).flat())
  );

  private orgAnalytics$ = this.analytics.getOrganizationAnalytics().pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );

  // The analytics of each buyer who interacted with sellers' title or organization
  private analyticsWithUsersAndOrgs$ = combineLatest([this.titleAnalytics$, this.orgAnalytics$]).pipe(
    map(([titles, organizations]) => {
      const analytics = [...titles, ...organizations];
      const uids = unique(analytics.map(analytic => analytic.meta.uid));
      const orgIds = unique(analytics.map(analytic => analytic.meta.orgId));
      return { uids, orgIds, analytics };
    }),
    joinWith({
      users: ({ uids }) => this.userService.load(uids),
      orgs: ({ orgIds }) => this.orgService.load(orgIds)
    }, { shouldAwait: true }),
    map(({ uids, users, ...rest }) => ({
      users: uids.map(uid => users.filter(u => !!u).find(u => u.uid === uid) || createUser({ uid, lastName: deletedIdentifier.user })),
      ...rest
    })),
    map(({ orgs, analytics, users, ...rest }) => {
      const filteredData = removeSellerData(orgs, analytics, users);
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
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  orgActivity$ = firstValueFrom(this.buyersAnalytics$.pipe(
    map(aggregated => counter(aggregated, 'org.activity')),
    map(counted => countedToAnalyticData(counted, 'orgActivity'))
  ));

  aggregatedCards$ = firstValueFrom(this.analyticsWithUsersAndOrgs$.pipe(
    map(({ analytics }) => aggregate(analytics)),
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

  goToBuyer(data: AggregatedAnalytic) {
    if (data.user.lastName !== deletedIdentifier.user) {
      this.router.navigate([data.user.uid], { relativeTo: this.route });
    }
  }
}
