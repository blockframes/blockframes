import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { getValue, downloadCsvFromJson } from '@blockframes/utils/helpers';
import { BehaviorStore } from '@blockframes/utils/observable-helpers';
import { UserService } from '@blockframes/user/+state/user.service';
import { CrmService } from '@blockframes/admin/crm/+state/crm.service';
import { CrmQuery } from '@blockframes/admin/crm/+state/crm.query';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { orgName } from '@blockframes/organization/+state';
import { getAllAppsExcept, appName, getOrgModuleAccess, modules } from '@blockframes/utils/apps';
import { territories } from '@blockframes/utils/static-model/static-model';
import { take, tap } from 'rxjs/operators';
import { User } from '@sentry/types';

@Component({
  selector: 'crm-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersComponent implements OnInit {
  public versionColumns = {
    'uid': { value: 'Id', disableSort: true },
    'firstName': 'FirstName',
    'lastName': 'LastName',
    'org': 'Organization',
    'email': 'Email',
    'firstConnexion': 'First connexion',
    'lastConnexion': 'Last connexion',
    'pageView': 'Page view',
    'sessionCount': 'Session count',
    'createdFrom': 'Created from',
  };

  public initialColumns: string[] = [
    'uid',
    'firstName',
    'lastName',
    'org',
    'email',
    'firstConnexion',
    'lastConnexion',
    'pageView',
    'sessionCount',
    'createdFrom',
  ];
  public users$?: Promise<User[]>;
  public exporting = new BehaviorStore(false);
  public app = getAllAppsExcept(['crm']);

  constructor(
    private userService: UserService,
    private cdRef: ChangeDetectorRef,
    private crmService: CrmService,
    private crmQuery: CrmQuery,
    private orgService: OrganizationService,
    private router: Router,
  ) { }

  async ngOnInit() {
    // Use valueChanges to take advantage of caching
    this.users$ = Promise.all([
      this.userService.valueChanges().pipe(take(1)).toPromise(),
      this.orgService.valueChanges().pipe(take(1)).toPromise(),
      this.crmService.loadAnalyticsData()
    ]).then(([users, orgs]) => {
      return users.map(u => {
        const org = orgs.find(o => o.id === u.orgId);
        return {
          uid: u.uid,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          firstConnexion: this.crmQuery.getFirstConnexion(u.uid),
          lastConnexion: this.crmQuery.getLastConnexion(u.uid),
          pageView: this.crmQuery.getPageView(u.uid),
          sessionCount: this.crmQuery.getSessionCount(u.uid),
          createdFrom: u._meta?.createdFrom ? appName[u._meta?.createdFrom] : '',
          org: org,
        };
      })
    });
  }

  public goToEdit(user) {
    this.router.navigate([`c/o/dashboard/crm/user/${user.uid}`]);
  }

  public filterPredicate(data, filter: string) {
    const columnsToFilter = [
      'uid',
      'firstName',
      'lastName',
      'email'
    ];
    if (data.org?.denomination?.full) columnsToFilter.push('org.denomination.full', 'org.denomination.public');
    const dataStr = columnsToFilter.map(c => getValue(data, c)).join();
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

  public async exportTable() {
    try {
      this.exporting.value = true;

      const [users, orgs] = await Promise.all([this.userService.getAllUsers(), this.orgService.getValue()]);
      const promises = users.map(async u => {
        const org = orgs.find(o => o.id === u.orgId);
        return {
          ...u,
          firstConnexion: this.crmQuery.getFirstConnexion(u.uid),
          lastConnexion: this.crmQuery.getLastConnexion(u.uid),
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
          'first connexion': r.firstConnexion ?? '--',
          'last connexion': r.lastConnexion ?? '--',
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
