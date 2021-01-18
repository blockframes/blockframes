import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { getValue, downloadCsvFromJson, BehaviorStore } from '@blockframes/utils/helpers';
import { UserService } from '@blockframes/user/+state/user.service';
import { AdminService } from '@blockframes/admin/admin/+state/admin.service';
import { AdminQuery } from '@blockframes/admin/admin/+state/admin.query';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { orgName } from '@blockframes/organization/+state';
import { appName, getOrgModuleAccess } from '@blockframes/utils/apps';

@Component({
  selector: 'admin-users',
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
  public rows: any[] = [];
  public exporting =  new BehaviorStore(false);

  constructor(
    private userService: UserService,
    private cdRef: ChangeDetectorRef,
    private adminService: AdminService,
    private adminQuery: AdminQuery,
    private orgService: OrganizationService,
    private router: Router,
    ) { }

  async ngOnInit() {
    await this.adminService.loadAnalyticsData();

    const [users, orgs] = await Promise.all([this.userService.getAllUsers(), this.orgService.getValue()]);
    this.rows = users.map(u => {
      const org = orgs.find(org => org.id === u.orgId);
      return { 
        uid: u.uid,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        firstConnexion: this.adminQuery.getFirstConnexion(u.uid),
        lastConnexion: this.adminQuery.getLastConnexion(u.uid),
        pageView: this.adminQuery.getPageView(u.uid),
        sessionCount: this.adminQuery.getSessionCount(u.uid),
        createdFrom: !! u._meta?.createdFrom ? appName[u._meta?.createdFrom] : '',
        org: org,
      };
    })

    this.cdRef.markForCheck();
  }

  public goToEdit(user) {
    this.router.navigate([`c/o/admin/panel/user/${user.uid}`]);
  }

  public filterPredicate(data: any, filter: string) {
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
        const org = orgs.find(org => org.id === u.orgId);
        return {
          ...u,
          firstConnexion: this.adminQuery.getFirstConnexion(u.uid),
          lastConnexion: this.adminQuery.getLastConnexion(u.uid),
          pageView: this.adminQuery.getPageView(u.uid),
          sessionCount: this.adminQuery.getSessionCount(u.uid),
          createdFrom: !! u._meta?.createdFrom ? appName[u._meta?.createdFrom] : '',
          edit: {
            id: u.uid,
            link: `/c/o/admin/panel/user/${u.uid}`,
          },
          org: org,
          orgCountry: org?.addresses?.main.country,
          userOrgRole: org ? await this.orgService.getMemberRole(org, u.uid) : undefined,
          type: org ? (getOrgModuleAccess(org).includes('dashboard') ? 'seller' : 'buyer') : undefined
        }
      })
      const data = await Promise.all(promises);
      const exportedRows = data.map(r => ({
        'userId': r.uid,
        'first name': r.firstName ? r.firstName : '--',
        'last name': r.lastName ? r.lastName : '--',
        'organization': r.org ? orgName(r.org) : '--',
        'org id': r.orgId ? r.orgId : '--',
        'type': r.type ? r.type : '--',
        'country': r.org?.addresses.main.country ?? '--',
        'role': r.userOrgRole ? r.userOrgRole : '--',
        'position': r.position ? r.position : '--',
        'org activity': r.org ? r.org.activity : '--', 
        'email': r.email,
        'first connexion': r.firstConnexion ? r.firstConnexion : '--',
        'last connexion': r.lastConnexion ? r.lastConnexion : '--',
        'page view': r.pageView ? r.pageView : '--',
        'session count': r.sessionCount ? r.sessionCount : '--',
        'created from': r.createdFrom ? r.createdFrom : '--',
      }))
      downloadCsvFromJson(exportedRows, 'user-list');

      this.exporting.value = false;
    } catch (err) {
      this.exporting.value = false;
    }
  }
}
