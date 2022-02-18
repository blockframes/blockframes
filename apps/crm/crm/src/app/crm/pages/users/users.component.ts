import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { downloadCsvFromJson } from '@blockframes/utils/helpers';
import { UserService, User } from '@blockframes/user/+state';
import { CrmService } from '@blockframes/admin/crm/+state/crm.service';
import { CrmQuery } from '@blockframes/admin/crm/+state/crm.query';
import { OrganizationService, Organization } from '@blockframes/organization/+state';
import { orgName } from '@blockframes/organization/+state';
import { getAllAppsExcept, appName, getOrgModuleAccess, modules } from '@blockframes/utils/apps';
import { take, map } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';

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
  public app = getAllAppsExcept(['crm']);

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private crmService: CrmService,
    private crmQuery: CrmQuery,
    private orgService: OrganizationService,
    private router: Router,
  ) {}

  async ngOnInit() {
    // Use valueChanges to take advantage of caching.
    this.users$ = combineLatest([
      this.userService.valueChanges().pipe(take(2)),
      this.orgService.valueChanges().pipe(take(2)),
      this.crmService.loadAnalyticsData()
    ]).pipe(
      map(([users, orgs]) => {
        return users.map(u => {
          const org = orgs.find(o => o.id === u.orgId);
          return {
            ...u,
            firstConnection: this.crmQuery.getFirstConnexion(u.uid),
            lastConnection: this.crmQuery.getLastConnexion(u.uid),
            pageView: this.crmQuery.getPageView(u.uid),
            sessionCount: this.crmQuery.getSessionCount(u.uid),
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
      const getRows = users.map(async r => {
        const role = r.org ? await this.orgService.getMemberRole(r.org, r.uid) : '--';
        const type = r.org ? getOrgModuleAccess(r.org).includes('dashboard') ? 'seller' : 'buyer' : '--';
        const row = {
          'userId': r.uid,
          'first name': r.firstName ?? '--',
          'last name': r.lastName ?? '--',
          'organization': r.org ? orgName(r.org) : '--',
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
}
