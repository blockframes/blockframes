import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnalyticsService } from '@blockframes/analytics/service';
import { aggregate, counter } from '@blockframes/analytics/utils';
import { AggregatedAnalytic, App } from '@blockframes/model';
import { fromOrgAndAccepted, MovieService } from '@blockframes/movie/service';
import { OrganizationService } from '@blockframes/organization/service';
import { UserService } from '@blockframes/user/service';
import { unique } from '@blockframes/utils/helpers';
import { joinWith } from 'ngfire';
import { APP } from '@blockframes/utils/routes/utils';
import { map } from 'rxjs/operators';

@Component({
  selector: 'festival-buyers-analytics',
  templateUrl: './buyers-analytics.component.html',
  styleUrls: ['./buyers-analytics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuyersAnalyticsComponent {

  // The analytics of each buyer who interacted with sellers' title
  analyticsWithUsersAndOrgs$ = this.titleService.valueChanges(fromOrgAndAccepted(this.orgService.org.id, this.app)).pipe(
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
    }, { shouldAwait: true })
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

  orgActivity$ = this.analyticsWithUsersAndOrgs$.pipe(
    map(({ orgs, analytics }) => {
      return analytics.map(analytic => {
        return {
          ...analytic,
          org: orgs.find(org => org.id === analytic.meta.orgId),
        };
      });
    }),
    map(analytics => counter(analytics, 'org.activity', 'orgActivity'))
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

  goToBuyer(data: AggregatedAnalytic) {
    this.router.navigate([data.user.uid], { relativeTo: this.route });
  }
}
