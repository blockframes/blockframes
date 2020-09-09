import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { getValue, downloadCsvFromJson, BehaviorStore } from '@blockframes/utils/helpers';
import { UserService } from '@blockframes/user/+state/user.service';
import { AdminService } from '@blockframes/admin/admin/+state/admin.service';
import { AdminQuery } from '@blockframes/admin/admin/+state/admin.query';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { orgName } from '@blockframes/organization/+state';
import { getOrgModuleAccess } from '@blockframes/utils/apps';

@Component({
  selector: 'admin-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersComponent implements OnInit {
  public versionColumns = {
    'uid': 'Id',
    'firstName': 'FirstName',
    'lastName': 'LastName',
    'org': 'Organization',
    'email': 'Email',
    'firstConnexion': 'First connexion',
    'lastConnexion': 'Last connexion',
    'edit': 'Edit',
  };

  public initialColumns: string[] = [
    'uid',
    'firstName',
    'lastName',
    'org',
    'email',
    'firstConnexion',
    'lastConnexion',
    'edit',
  ];
  public rows: any[] = [];
  public orgs: Record<string, Organization> = {};
  public exporting =  new BehaviorStore(false);

  constructor(
    private userService: UserService,
    private cdRef: ChangeDetectorRef,
    private adminService: AdminService,
    private adminQuery: AdminQuery,
    private orgService: OrganizationService,
  ) { }

  async ngOnInit() {
    await this.adminService.loadAnalyticsData();

    const users = await this.userService.getAllUsers();
    const rows = users.map(async u => {
      const org = u.orgId ? await this.getOrg(u.orgId) : undefined;
      return {
        uid: u.uid,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        firstConnexion: this.adminQuery.getFirstConnexion(u.uid),
        lastConnexion: this.adminQuery.getLastConnexion(u.uid),
        edit: {
          id: u.uid,
          link: `/c/o/admin/panel/user/${u.uid}`,
        },
        org: org,
      }
    });

    this.rows = await Promise.all(rows);
    this.cdRef.markForCheck();
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

      const users = await this.userService.getAllUsers();
      const promises = users.map(async u => {
        const org = u.orgId ? await this.getOrg(u.orgId) : undefined;
        return {
          ...u,
          firstConnexion: this.adminQuery.getFirstConnexion(u.uid),
          lastConnexion: this.adminQuery.getLastConnexion(u.uid),
          edit: {
            id: u.uid,
            link: `/c/o/admin/panel/user/${u.uid}`,
          },
          org: org,
          orgCountry: org?.addresses?.main.country,
          userOrgRole: org ? await this.orgService.getMemberRole(org, u.uid) : undefined,
          type: org ? (getOrgModuleAccess(org).includes('dashboard') ? 'seller' : 'buyer') : undefined
        }
      });
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
        'email': r.email,
        'first connexion': r.firstConnexion ? r.firstConnexion : '--',
        'last connexion': r.lastConnexion ? r.lastConnexion : '--',
      }))
      downloadCsvFromJson(exportedRows, 'user-list');

      this.exporting.value = false;
    } catch (err) {
      this.exporting.value = false;
    }
  }

  private async getOrg(id: string): Promise<Organization> {
    if (!this.orgs[id]) {
      this.orgs[id] = await this.orgService.getValue(id);
    }

    return this.orgs[id];
  }

}
