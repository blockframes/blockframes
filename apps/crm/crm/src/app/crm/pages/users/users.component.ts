import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { downloadCsvFromJson } from '@blockframes/utils/helpers';
import { BehaviorStore } from '@blockframes/utils/observable-helpers';
import { UserService } from '@blockframes/user/+state/user.service';
import { CrmService } from '@blockframes/admin/crm/+state/crm.service';
import { CrmQuery } from '@blockframes/admin/crm/+state/crm.query';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { orgName } from '@blockframes/organization/+state';
import { getAllAppsExcept, appName, getOrgModuleAccess, modules } from '@blockframes/utils/apps';
import { territories } from '@blockframes/utils/static-model/static-model';
import { take, map, startWith, tap } from 'rxjs/operators';
import { User } from '@sentry/types';
import { combineLatest, from, Observable } from 'rxjs';

@Component({
  selector: 'crm-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersComponent implements OnInit {
  public users$?: Observable<User[]>;
  public exporting = new BehaviorStore(false);
  public app = getAllAppsExcept(['crm']);

  constructor(
    private userService: UserService,
    private crmService: CrmService,
    private crmQuery: CrmQuery,
    private orgService: OrganizationService,
    private router: Router,
  ) {}

  async ngOnInit() {
    // Use valueChanges to take advantage of caching. Takes 2 to avoid hitting indexedDB
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

  // TODO: Update that with the new users in params
  public async exportTable() {
    try {
      this.exporting.value = true;

      const [users, orgs] = await Promise.all([this.userService.getAllUsers(), this.orgService.getValue()]);
      const promises = users.map(async u => {
        const org = orgs.find(o => o.id === u.orgId);
        return {
          ...u,
          firstConnection: this.crmQuery.getFirstConnexion(u.uid),
          lastConnection: this.crmQuery.getLastConnexion(u.uid),
          pageView: this.crmQuery.getPageView(u.uid),
          sessionCount: this.crmQuery.getSessionCount(u.uid),
          createdFrom: u._meta?.createdFrom ? appName[u._meta?.createdFrom] : '',
          edit: {
            id: u.uid,
            link: `/c/o/dashboard/crm/user/${u.uid}`,
          },
          org: org,
          orgCountry: org?.addresses?.main.country && territories[org.addresses?.main.country] ? territories[org.addresses?.main.country] : '--',
          userOrgRole: org ? await this.orgService.getMemberRole(org, u.uid) : undefined,
          type: org ? (getOrgModuleAccess(org).includes('dashboard') ? 'seller' : 'buyer') : undefined
        }
      });

      const data = await Promise.all(promises);
      const exportedRows = data.map(r => {
        const row = {
          'userId': r.uid,
          'first name': r.firstName ?? '--',
          'last name': r.lastName ?? '--',
          'organization': r.org ? orgName(r.org) : '--',
          'org id': r.orgId ?? '--',
          'org status': r.org ? r.org.status : '--',
          'type': r.type ? r.type : '--',
          'country': r.orgCountry,
          'role': r.userOrgRole ? r.userOrgRole : '--',
          'position': r.position ?? '--',
          'org activity': r.org ? r.org.activity : '--',
          'email': r.email,
          'first connection': r.firstConnection ?? '--',
          'last connection': r.lastConnection ?? '--',
          'page view': r.pageView ?? '--',
          'session count': r.sessionCount ?? '--',
          'created from': r.createdFrom ?? '--',
        }

        for (const a of this.app) {
          for (const module of modules) {
            row[`${appName[a]} - ${module}`] = !!r.org?.appAccess[a] && r.org.appAccess[a][module] ? 'true' : 'false';
          }
        }

        return row;
      })
      downloadCsvFromJson(exportedRows, 'user-list');

      this.exporting.value = false;
    } catch (err) {
      this.exporting.value = false;
    }
  }
}
