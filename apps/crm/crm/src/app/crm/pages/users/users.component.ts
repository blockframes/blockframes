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
  EventName
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
import { format } from 'date-fns';
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

  public async exportTitleAnalytics(users: CrmUser[]) {
    this.exportingAnalytics = true;
    this.cdr.markForCheck();

    const query = [where('type', '==', 'title')];
    const all = await this.analyticsService.load<Analytics<'title'>>(query);
    const allAnalytics = all.filter(analytic => !analytic.meta.ownerOrgIds.includes(analytic.meta.orgId));

    const allTitleIds = unique(allAnalytics.map(analytic => analytic.meta.titleId));
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
          'org name': org ? org.name : '--deleted org--',
          titleId: id,
          title: title?.title.international ?? '--deleted title--',
          'title org id(s)': title?.orgIds?.join(', '),
          'title org(s) name': orgs.map(o => o.name).join(', '),
          'total interactions': a.interactions.global.count,
          'interactions on catalog': a.interactions.catalog.count,
          'interactions on festival': a.interactions.festival.count,
          'first interaction on catalog': a.interactions.catalog.first ? format(a.interactions.catalog.first, 'MM/dd/yyyy') : '--',
          'last interaction on catalog': a.interactions.catalog.last ? format(a.interactions.catalog.last, 'MM/dd/yyyy') : '--',
          'last interaction on festival': a.interactions.festival.last ? format(a.interactions.festival.last, 'MM/dd/yyyy') : '--',
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

    this.exportingAnalytics = false;
    this.cdr.markForCheck();
  }

  public async exportSearchAnalytics(eventNames: EventName[]) {
    this.exportingAnalytics = true;
    this.cdr.markForCheck();

    const query = [where('type', '==', 'titleSearch'), where('name', 'in', eventNames)];
    const all = await this.analyticsService.load<Analytics<'titleSearch'>>(query);

    const allUids = unique(all.map(analytic => analytic.meta.uid));
    const allUsers = await this.userService.load(allUids);
    const allOrgIds = unique(allUsers.map(u => u.orgId));
    const allOrgs = await this.orgService.load(allOrgIds);

    const exportedRows = [];

    for (const titleSearch of all) {
      const user = allUsers.find(u => u.uid === titleSearch._meta.createdBy);
      const org = allOrgs.find(o => o.id === user.orgId);
      const availsSearch = titleSearch.meta.search?.avails as AvailsFilter;
      const search = titleSearch.meta.search?.search;

      const row = {
        // Common
        uid: titleSearch._meta.createdBy,
        user: user ? displayName(user) : '--deleted user--',
        email: user.email,
        orgId: user.orgId,
        'org name': org ? org.name : '--deleted org--',
        date: format(titleSearch._meta.createdAt, 'MM/dd/yyyy'),
        'event name': titleSearch.name,
        app: titleSearch._meta.createdFrom,
        module: titleSearch.meta.module,
        status: titleSearch.meta.status,
        // Avails
        from: availsSearch?.duration?.from ? format(availsSearch.duration.from, 'MM/dd/yyyy') : '--',
        to: availsSearch?.duration?.to ? format(availsSearch.duration.to, 'MM/dd/yyyy') : '--',
        territories: toGroupLabel((availsSearch?.territories ?? []), 'territories', 'World').join(', '),
        medias: toGroupLabel((availsSearch?.medias ?? []), 'medias', 'All Rights').join(', '),
        exclusivity: availsSearch?.exclusive,

      };

      // Search
      if (!eventNames.includes('filteredAvailsCalendar') && !eventNames.includes('filteredAvailsMap')) {
        row['search'] = search?.query ?? '--';
        row['content type'] = search?.contentType ? toLabel(search.contentType, 'contentType') : '--';
        row['genres'] = toLabel((search?.genres ?? []), 'genres');
        row['origin countries'] = toLabel(search?.originCountries ?? [], 'territories');
        row['languages'] = toLabel(search?.languages?.languages ?? [], 'languages');
        row['version'] = `${search?.languages?.versions.caption ? 'captioned ' : ''}${search?.languages?.versions.dubbed ? 'dubbed ' : ''}${search?.languages?.versions.subtitle ? 'subtitled ' : ''}${search?.languages?.versions.original ? 'original' : ''}`
        row['festival selection'] = toLabel(search?.festivals ?? [], 'festival');
        row['qualifications'] = toLabel(search?.certifications, 'certifications');
        row['min release year'] = search?.minReleaseYear ?? '--';
        row['min budget'] = search?.minBudget ?? '--';
      }

      // PDF
      if (eventNames.includes('exportedTitles')) {
        row['title count'] = titleSearch.meta.titleCount ?? '--';
      }

      exportedRows.push(row);
    }

    if (exportedRows.length) {
      downloadCsvFromJson(exportedRows, `${eventNames.join('-')}-analytics-list`);
    } else {
      this.snackbar.open('No data to export', 'close', { duration: 5000 });
    }


    this.exportingAnalytics = false;
    this.cdr.markForCheck();
  }
}
