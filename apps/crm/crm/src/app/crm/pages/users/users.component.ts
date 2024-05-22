import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { downloadCsvFromJson, unique } from '@blockframes/utils/helpers';
import { UserService } from '@blockframes/user/service';
import { AnalyticsService } from '@blockframes/analytics/service';
import { OrganizationService } from '@blockframes/organization/service';
import { map, tap } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { sorts } from '@blockframes/ui/list/table/sorts';
import { PermissionsService } from '@blockframes/permissions/service';
import { MovieService } from '@blockframes/movie/service';
import { where } from 'firebase/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  CrmUser,
  Organization,
  getAllAppsExcept,
  appName,
  Analytics,
  EventName,
  filterOwnerEvents,
  crmUsersToExport,
  titleAnalyticsToExport,
  orgAnalyticsToExport,
  searchAnalyticsToExport,
} from '@blockframes/model';

@Component({
  selector: 'crm-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersComponent implements OnInit {
  public users$?: Observable<CrmUser[]>;
  public exporting = false;
  public exportingAnalytics = false;
  public app = getAllAppsExcept(['crm']);
  public sorts = sorts;
  private orgs: Organization[] = [];

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private analyticsService: AnalyticsService,
    private orgService: OrganizationService,
    private router: Router,
    private permissionsService: PermissionsService,
    private movieService: MovieService,
    private snackbar: MatSnackBar,
  ) { }

  async ngOnInit() {
    // Use valueChanges to take advantage of caching.
    this.users$ = combineLatest([
      this.userService.valueChanges(),
      this.orgService.valueChanges(),
      this.analyticsService.loadAnalyticsData()
    ]).pipe(
      tap(([_, orgs]) => this.orgs = orgs),
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
        });
      })
    )
  }

  public goToEdit(user: CrmUser) {
    this.router.navigate([`c/o/dashboard/crm/user/${user.uid}`]);
  }

  public async exportTable(users: CrmUser[]) {
    try {
      this.exporting = true;
      this.cdr.markForCheck()

      const permissions = await this.permissionsService.load();

      const titleQuery = [where('type', '==', 'title'), where('name', '==', 'pageView')];
      const titleAnalytics = await this.analyticsService.load<Analytics<'title'>>(titleQuery);

      const orgQuery = [where('type', '==', 'organization'), where('name', '==', 'orgPageView')];
      const orgAnalytics = await this.analyticsService.load<Analytics<'organization'>>(orgQuery);

      const titleSearchQuery = [where('type', '==', 'titleSearch')];
      const titleSearchAnalytics = await this.analyticsService.load<Analytics<'titleSearch'>>(titleSearchQuery);

      const allAnalytics = filterOwnerEvents([...titleAnalytics, ...orgAnalytics, ...titleSearchAnalytics]);

      const rows = crmUsersToExport(users, allAnalytics, permissions, 'csv');

      downloadCsvFromJson(rows, 'user-list');
    } catch (err) {
      console.error(err);
    }
    this.exporting = false;
    this.cdr.markForCheck();
  }

  public async exportTitleAnalytics(users: CrmUser[]) {
    this.exportingAnalytics = true;
    this.cdr.markForCheck();

    const titleQuery = [where('type', '==', 'title')];
    const titleAnalytics = await this.analyticsService.load<Analytics<'title'>>(titleQuery);

    const availsSearchQuery = [where('type', '==', 'titleSearch'), where('name', 'in', ['filteredAvailsCalendar', 'filteredAvailsMap'])];
    const availsSearchAnalytics = await this.analyticsService.load<Analytics<'titleSearch'>>(availsSearchQuery);

    const allAnalytics = filterOwnerEvents([...titleAnalytics, ...availsSearchAnalytics]);

    const allTitleIds = unique(allAnalytics.map(analytic => analytic.meta.titleId).filter(t => !!t));
    const allTitles = await this.movieService.load(allTitleIds);

    const rows = titleAnalyticsToExport(users, allAnalytics, allTitles, allTitleIds, this.orgs, 'csv');

    downloadCsvFromJson(rows, 'users-analytics-list');

    this.exportingAnalytics = false;
    this.cdr.markForCheck();
  }

  public async exportOrgAnalyticsPageViews() {
    this.exportingAnalytics = true;
    this.cdr.markForCheck();

    const organizationQuery = [where('type', '==', 'organization'), where('name', '==', 'orgPageView')];
    const organizationAnalytics = await this.analyticsService.load<Analytics<'organization'>>(organizationQuery);

    const rows = orgAnalyticsToExport(organizationAnalytics, this.orgs);

    if (rows.length) {
      downloadCsvFromJson(rows, 'users-orgs-page-views');
    } else {
      this.snackbar.open('No data to export', 'close', { duration: 5000 });
    }

    this.exportingAnalytics = false;
    this.cdr.markForCheck();
  }

  public async exportSearchAnalytics(users: CrmUser[]) {
    this.exportingAnalytics = true;
    this.cdr.markForCheck();

    const searchAnalyticsEventNames: EventName[] = [
      'filteredTitles',
      'savedFilters',
      'loadedFilters',
      'exportedTitles',
      'filteredAvailsCalendar',
      'filteredAvailsMap'
    ];

    const query = [where('type', '==', 'titleSearch'), where('name', 'in', searchAnalyticsEventNames)];
    const searchAnalytics = await this.analyticsService.load<Analytics<'titleSearch'>>(query);

    const allTitleIds = unique(searchAnalytics.map(analytic => analytic.meta.titleId).filter(t => !!t));
    const allTitles = await this.movieService.load(allTitleIds);

    const rows = searchAnalyticsToExport(searchAnalytics, users, this.orgs, allTitles, 'csv');

    if (rows.length) {
      downloadCsvFromJson(rows, 'search-analytics-list');
    } else {
      this.snackbar.open('No data to export', 'close', { duration: 5000 });
    }

    this.exportingAnalytics = false;
    this.cdr.markForCheck();
  }
}
