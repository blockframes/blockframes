import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { downloadCsvFromJson, unique } from '@blockframes/utils/helpers';
import { UserService } from '@blockframes/user/service';
import {
  User,
  Organization,
  getAllAppsExcept,
  appName,
  getOrgModuleAccess,
  modules,
  Analytics,
  displayName,
  toLabel,
  AvailsFilter,
  EventName,
  PublicUser,
  AnonymousCredentials,
  filterOwnerEvents,
  deletedIdentifier,
  maxBudget
} from '@blockframes/model';
import { AnalyticsService } from '@blockframes/analytics/service';
import { OrganizationService } from '@blockframes/organization/service';
import { map, tap } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { sorts } from '@blockframes/ui/list/table/sorts';
import { PermissionsService } from '@blockframes/permissions/service';
import { MovieService } from '@blockframes/movie/service';
import { where } from 'firebase/firestore';
import { aggregate } from '@blockframes/analytics/utils';
import { toGroupLabel } from '@blockframes/utils/pipes';
import { MatSnackBar } from '@angular/material/snack-bar';

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

      const roles = await this.permissionsService.load();
      const getMemberRole = (r: CrmUser) => {
        const role = roles.find(role => role.id === r.orgId);
        if (!role) return;
        return role.roles[r.uid];
      }

      const titleQuery = [where('type', '==', 'title'), where('name', '==', 'pageView')];
      const titleAnalytics = await this.analyticsService.load<Analytics<'title'>>(titleQuery);

      const orgQuery = [where('type', '==', 'organization'), where('name', '==', 'orgPageView')];
      const orgAnalytics = await this.analyticsService.load<Analytics<'organization'>>(orgQuery);

      const titleSearchQuery = [where('type', '==', 'titleSearch')];
      const titleSearchAnalytics = await this.analyticsService.load<Analytics<'titleSearch'>>(titleSearchQuery);

      const allAnalytics = filterOwnerEvents([...titleAnalytics, ...orgAnalytics, ...titleSearchAnalytics]);

      const rows = users.map(r => {
        const userAnalytics = allAnalytics.filter(analytic => analytic.meta.uid === r.uid);
        const a = aggregate(userAnalytics);
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
          'buying preferences territories': r.preferences?.territories.join(', ') ?? '--',

          'total interactions': a.interactions.global.count,
          'interactions on catalog': a.interactions.catalog.count,
          'interactions on festival': a.interactions.festival.count,
          'first interaction on catalog': a.interactions.catalog.first ? a.interactions.catalog.first : '--',
          'last interaction on catalog': a.interactions.catalog.last ? a.interactions.catalog.last : '--',
          'last interaction on festival': a.interactions.festival.last ? a.interactions.festival.last : '--',
          'line-up views': a.orgPageView,
          'title views': a.pageView,
          'exported Titles': a.exportedTitles,
          'filtered Titles': a.filteredTitles,
          'saved Filters': a.savedFilters,
          'loadedFilters': a.loadedFilters,
          'filtered Avails Calendar': a.filteredAvailsCalendar,
          'filtered Avails Map': a.filteredAvailsMap,
        };

        for (const a of this.app) {
          for (const module of modules) {
            row[`${appName[a]} - ${module}`] = r.org?.appAccess[a]?.[module] ? 'true' : 'false';
          }
        }

        return row;
      });

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

    const exportedRows = [];
    for (const user of users) {
      const org = this.orgs.find(o => o.id === user.orgId);
      const userAnalytics = allAnalytics.filter(analytic => analytic.meta.uid === user.uid);
      const titleIdsWithAnalytics = allTitleIds.filter(id => userAnalytics.some(analytic => analytic.meta.titleId === id));

      for (const id of titleIdsWithAnalytics) {
        const titleAnalytics = userAnalytics.filter(analytic => analytic.meta.titleId === id);
        const title = allTitles.find(t => t?.id === id);
        const a = aggregate(titleAnalytics);
        const orgs = this.orgs.filter(o => title?.orgIds.includes(o.id));

        exportedRows.push({
          uid: user.uid,
          user: displayName(user),
          email: user.email,
          'user org id': user.orgId,
          'org name': org ? org.name : deletedIdentifier.org,
          titleId: id,
          title: title?.title.international ?? deletedIdentifier.title,
          'title org id(s)': title?.orgIds?.join(', '),
          'title org(s) name': orgs.map(o => o.name).join(', '),
          'total interactions': a.interactions.global.count,
          'interactions on catalog': a.interactions.catalog.count,
          'interactions on festival': a.interactions.festival.count,
          'first interaction on catalog': a.interactions.catalog.first ? a.interactions.catalog.first : '--',
          'last interaction on catalog': a.interactions.catalog.last ? a.interactions.catalog.last : '--',
          'last interaction on festival': a.interactions.festival.last ? a.interactions.festival.last : '--',
          'page views': a.pageView,
          'screenings requested': a.screeningRequested,
          'screener requested': a.screenerRequested,
          'asking price requested': a.askingPriceRequested,
          'promo element opened': a.promoElementOpened,
          'added to wishlist': a.addedToWishlist,
          'removed from wishlist': a.removedFromWishlist,
          'filtered Avails Calendar': a.filteredAvailsCalendar,
          'filtered Avails Map': a.filteredAvailsMap,
        });
      }
    }
    downloadCsvFromJson(exportedRows, 'users-analytics-list');

    this.exportingAnalytics = false;
    this.cdr.markForCheck();
  }

  public async exportOrgAnalyticsPageViews() {
    this.exportingAnalytics = true;
    this.cdr.markForCheck();

    const organizationQuery = [where('type', '==', 'organization'), where('name', '==', 'orgPageView')];
    const organizationAnalytics = await this.analyticsService.load<Analytics<'organization'>>(organizationQuery);

    const aggregator: Record<string, {
      profile: PublicUser | AnonymousCredentials,
      orgId?: string,
      isAnonymous: boolean,
      views: Record<string, Date[]>
    }> = {};

    const exportedRows = [];
    for (const analytic of filterOwnerEvents(organizationAnalytics)) {
      if (!aggregator[analytic.meta.profile.email]) {
        aggregator[analytic.meta.profile.email] = {
          profile: analytic.meta.profile,
          orgId: analytic.meta.orgId,
          isAnonymous: !analytic.meta.orgId,
          views: {}
        }
      }

      if (!aggregator[analytic.meta.profile.email].views[analytic.meta.organizationId]) {
        aggregator[analytic.meta.profile.email].views[analytic.meta.organizationId] = [];
      }
      aggregator[analytic.meta.profile.email].views[analytic.meta.organizationId].push(analytic._meta.createdAt);
    }

    for (const [email, aggregated] of Object.entries(aggregator)) {
      const userOrg = aggregated.orgId ? this.orgs.find(o => o.id === aggregated.orgId) : undefined;
      const userOrgName = userOrg ? userOrg.name : deletedIdentifier.org;

      for (const [visitedOrgId, hits] of Object.entries(aggregated.views)) {
        const visitedOrg = this.orgs.find(o => o.id === visitedOrgId);
        for (const date of hits) {
          exportedRows.push({
            uid: aggregated.profile.uid,
            email,
            firstName: aggregated.profile.firstName,
            lastName: aggregated.profile.lastName,
            'user org id': aggregated.profile.orgId,
            'user org name': aggregated.isAnonymous ? '' : userOrgName,
            anonymous: aggregated.isAnonymous ? 'yes' : 'no',
            'visited org id': visitedOrgId,
            'visited org name': visitedOrg ? visitedOrg.name : deletedIdentifier.org,
            date
          });
        }
      }
    }

    if (exportedRows.length) {
      downloadCsvFromJson(exportedRows, 'users-orgs-page-views');
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
    const all = await this.analyticsService.load<Analytics<'titleSearch'>>(query);

    const allTitleIds = unique(all.map(analytic => analytic.meta.titleId).filter(t => !!t));
    const allTitles = await this.movieService.load(allTitleIds);

    const exportedRows = [];
    for (const titleSearch of all) {
      const user = users.find(u => u.uid === titleSearch._meta.createdBy);
      const org = this.orgs.find(o => o.id === user?.orgId);
      const availsSearch = titleSearch.meta.search?.avails as AvailsFilter;
      const search = titleSearch.meta.search?.search;

      const row = {
        // Common
        uid: titleSearch._meta.createdBy,
        user: user ? displayName(user) : deletedIdentifier.user,
        email: user?.email ?? '--',
        orgId: user?.orgId ?? '--',
        'org name': org ? org.name : deletedIdentifier.org,
        date: titleSearch._meta.createdAt,
        'event name': titleSearch.name,
        app: titleSearch._meta.createdFrom,
        module: titleSearch.meta.module,
        // Avails
        from: availsSearch?.duration?.from ? availsSearch.duration.from : '--',
        to: availsSearch?.duration?.to ? availsSearch.duration.to : '--',
        territories: toGroupLabel((availsSearch?.territories ?? []), 'territories', 'World').join(', '),
        medias: toGroupLabel((availsSearch?.medias ?? []), 'medias', 'All Rights').join(', '),
        exclusivity: availsSearch?.exclusive,
        // Search
        search: '',
        'content type': '',
        genres: '',
        'origin countries': '',
        languages: '',
        version: '',
        ['festival selection']: '',
        qualifications: '',
        'min release year': '',
        'max release year': '',
        'min budget': '',
        titleId: '',
        title: '',
        // Avails Search
        'title org id(s)': '',
        'title org(s) name': '',
        // PDF
        'exported title count': '',
        'export PDF status': '',
      };

      // Search
      if (!['filteredAvailsCalendar', 'filteredAvailsMap'].includes(titleSearch.name)) {
        row.search = search?.query ?? '--';
        row['content type'] = search?.contentType ? toLabel(search.contentType, 'contentType') : '--';
        row.genres = toLabel((search?.genres ?? []), 'genres');
        row['origin countries'] = toLabel(search?.originCountries ?? [], 'territories');
        row.languages = toLabel(search?.languages?.languages ?? [], 'languages');
        row.version = `${search?.languages?.versions.caption ? 'captioned ' : ''}${search?.languages?.versions.dubbed ? 'dubbed ' : ''}${search?.languages?.versions.subtitle ? 'subtitled ' : ''}${search?.languages?.versions.original ? 'original' : ''}`;
        row['festival selection'] = toLabel(search?.festivals ?? [], 'festival');
        row['qualifications'] = toLabel(search?.certifications, 'certifications');
        row['min release year'] = search?.releaseYear?.min ? search.releaseYear.min.toFixed(0) : '--';
        row['max release year'] = search?.releaseYear?.max ? search.releaseYear.max.toFixed(0) : '--';
        row['min budget'] = search?.minBudget ? (maxBudget - search.minBudget).toFixed(0) : '--';
      }

      // Avails Search
      if (['filteredAvailsCalendar', 'filteredAvailsMap'].includes(titleSearch.name)) {
        const title = allTitles.find(t => t?.id === titleSearch.meta.titleId);
        const orgs = this.orgs.filter(o => title?.orgIds.includes(o.id));
        row.titleId = titleSearch.meta.titleId ?? '--';
        row.title = title?.title.international ?? deletedIdentifier.title;
        row['title org id(s)'] = title?.orgIds?.join(', ');
        row['title org(s) name'] = orgs.map(o => o.name).join(', ');
      }

      // PDF
      if (titleSearch.name === 'exportedTitles') {
        row['exported title count'] = titleSearch.meta.titleCount.toFixed(0) ?? '--';
        row['export PDF status'] = titleSearch.meta.status ? 'true' : 'false';
      }

      exportedRows.push(row);
    }

    if (exportedRows.length) {
      downloadCsvFromJson(exportedRows, 'search-analytics-list');
    } else {
      this.snackbar.open('No data to export', 'close', { duration: 5000 });
    }


    this.exportingAnalytics = false;
    this.cdr.markForCheck();
  }
}
