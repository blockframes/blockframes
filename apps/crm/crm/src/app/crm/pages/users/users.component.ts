import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { downloadCsvFromJson, unique } from '@blockframes/utils/helpers';
import { UserService } from '@blockframes/user/service';
import { User, Organization, getAllAppsExcept, appName, getOrgModuleAccess, modules, Analytics, displayName } from '@blockframes/model';
import { AnalyticsService } from '@blockframes/analytics/service';
import { OrganizationService } from '@blockframes/organization/service';
import { map } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { sorts } from '@blockframes/ui/list/table/sorts';
import { PermissionsService } from '@blockframes/permissions/service';
import { MovieService } from '@blockframes/movie/service';
import { where } from 'firebase/firestore';
import { aggregate } from '@blockframes/analytics/utils';

interface CrmUser extends User {
  firstConnection: Date;
  lastConnection: Date;
  pageView: number;
  sessionCount: number;
  createdFrom: string;
  org: Organization;
}

@Component({
  selector: 'crm-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersComponent implements OnInit {
  public users$?: Observable<CrmUser[]>;
  public exporting = false;
  public exportingAnalaytics = false;
  public app = getAllAppsExcept(['crm']);
  public sorts = sorts;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private analyticsService: AnalyticsService,
    private orgService: OrganizationService,
    private router: Router,
    private permissionsService: PermissionsService,
    private movieService: MovieService
  ) { }

  async ngOnInit() {
    // Use valueChanges to take advantage of caching.
    this.users$ = combineLatest([
      this.userService.valueChanges(),
      this.orgService.valueChanges(),
      this.analyticsService.loadAnalyticsData()
    ]).pipe(
      map(([users, orgs]) => {
        return users.map(u => {
          const org = orgs.find(o => o.id === u.orgId);
          return {
            ...u,
            firstConnection: this.analyticsService.getFirstConnexion(u.uid),
            lastConnection: this.analyticsService.getLastConnexion(u.uid),
            pageView: this.analyticsService.getPageView(u.uid),
            sessionCount: this.analyticsService.getSessionCount(u.uid),
            createdFrom: u._meta?.createdFrom ? appName[u._meta?.createdFrom] : '',
            org,
          };
        })
      })
    )
  }

  public goToEdit(user) {
    this.router.navigate([`c/o/dashboard/crm/user/${user.uid}`]);
  }

  public goToEditNewTab(uid: string, $event: Event) {
    $event.stopPropagation();
    const urlTree = this.router.createUrlTree([`c/o/dashboard/crm/user/${uid}`])
    const url = this.router.serializeUrl(urlTree);
    window.open(url, '_blank', 'noreferrer');
  }

  public async exportTable(users: CrmUser[]) {
    try {
      this.exporting = true;
      this.cdr.markForCheck()

      const roles = await this.permissionsService.load();
      const getMemberRole = (r: CrmUser) => {
        const role = roles.find(role => role.id === r.orgId);
        if (!role) return;
        return role.roles[r.uid];
      }

      const getRows = users.map(async r => {
        const role = getMemberRole(r);
        const type = r.org ? getOrgModuleAccess(r.org).includes('dashboard') ? 'seller' : 'buyer' : '--';
        const row = {
          'userId': r.uid,
          'first name': r.firstName ?? '--',
          'last name': r.lastName ?? '--',
          'organization': r.org?.name || '--',
          'org id': r.orgId ?? '--',
          'org status': r.org ? r.org.status : '--',
          'type': type ?? '--',
          'country': r.org?.addresses.main.country ?? '--',
          'role': role ?? '--',
          'position': r.position ?? '--',
          'org activity': r.org ? r.org.activity : '--',
          'email': r.email,
          'first connection': r.firstConnection ?? '--',
          'last connection': r.lastConnection ?? '--',
          'page view': r.pageView ?? '--',
          'session count': r.sessionCount ?? '--',
          'created from': r.createdFrom ?? '--',
          'buying preferences language': r.preferences?.languages.join(', ') ?? '--',
          'buying preferences genres': r.preferences?.genres.join(', ') ?? '--',
          'buying preferences medias': r.preferences?.medias.join(', ') ?? '--',
          'buying preferences territories': r.preferences?.territories.join(', ') ?? '--'
        };

        for (const a of this.app) {
          for (const module of modules) {
            row[`${appName[a]} - ${module}`] = r.org?.appAccess[a]?.[module] ? 'true' : 'false';
          }
        }

        return row;
      });
      const rows = await Promise.all(getRows);
      downloadCsvFromJson(rows, 'user-list');
    } catch (err) {
      console.error(err);
    }
    this.exporting = false;
    this.cdr.markForCheck();
  }

  public async exportTitleAnalaytics(users: CrmUser[]) {
    this.exportingAnalaytics = true;
    this.cdr.markForCheck();

    const query = [where('type', '==', 'title')];
    const all = await this.analyticsService.load<Analytics<'title'>>(query);
    const allAnalytics = all.filter(analytic => !analytic.meta.ownerOrgIds.includes(analytic.meta.orgId));

    const allTitleIds = unique(allAnalytics.map(analytic => analytic.meta.titleId));
    const allTitles = await this.movieService.load(allTitleIds);

    const exportedRows = [];
    for (const user of users) {
      const userAnalytics = allAnalytics.filter(analytic => analytic.meta.uid === user.uid);
      const titleIdsWithAnalytics = allTitleIds.filter(id => userAnalytics.some(analytic => analytic.meta.titleId === id));

      for (const id of titleIdsWithAnalytics) {
        const titleAnalytics = userAnalytics.filter(analytic => analytic.meta.titleId === id);
        const title = allTitles.find(t => t?.id === id);
        const a = aggregate(titleAnalytics);

        exportedRows.push({
          uid: user.uid,
          user: displayName(user),
          email: user.email,
          titleId: id,
          title: title?.title.international ?? '--deleted title--',
          'total interactions': a.total,
          'page views': a.pageView,
          'screenings requested': a.screeningRequested,
          'asking price requested': a.askingPriceRequested,
          'promo element opened': a.promoElementOpened,
          'added to wishlist': a.addedToWishlist,
          'removed from wishlist': a.removedFromWishlist
        });
      }
    }
    downloadCsvFromJson(exportedRows, 'users-analytics-list');

    this.exportingAnalaytics = false;
    this.cdr.markForCheck();
  }
}
