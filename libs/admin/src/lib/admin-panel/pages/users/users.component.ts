import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { getValue, downloadCsvFromJson } from '@blockframes/utils/helpers';
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
    'avatar': 'Avatar',
    'firstName': 'FirstName',
    'lastName': 'LastName',
    'org': 'Organization',
    'type': 'Type',
    'orgCountry': 'Country',
    'userOrgRole': 'Role',
    'position': 'Position',
    'email': 'Email',
    'firstConnexion': 'First connexion',
    'lastConnexion': 'Last connexion',
    'edit': 'Edit',
  };

  public initialColumns: string[] = [
    'uid',
    'avatar',
    'firstName',
    'lastName',
    'org',
    'type',
    'orgCountry',
    'userOrgRole',
    'position',
    'email',
    'firstConnexion',
    'lastConnexion',
    'edit',
  ];
  public rows: any[] = [];
  public userListLoaded = false;
  public orgs: Record<string, Organization> = {};

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
        ...u,
        firstConnexion: this.adminQuery.getFirstConnexion(u.uid),
        lastConnexion: this.adminQuery.getLastConnexion(u.uid),
        edit: {
          id: u.uid,
          link: `/c/o/admin/panel/user/${u.uid}`,
        },
        org: org,
        orgCountry: org && org.addresses.main.country ? org.addresses.main.country : undefined,
        userOrgRole: org ? await this.orgService.getMemberRole(org, u.uid) : undefined,
        type: org ? (getOrgModuleAccess(org).includes('dashboard') ? 'seller' : 'buyer') : undefined
      }
    });

    this.userListLoaded = true;
    this.rows = await Promise.all(rows);
    this.cdRef.markForCheck();
  }

  public filterPredicate(data: any, filter: string) {
    const columnsToFilter = [
      'uid',
      'firstName',
      'lastName',
      'email',
      'position',
      'org',
    ];
    const dataStr = columnsToFilter.map(c => getValue(data, c)).join();
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

  public exportTable() {
    const exportedRows = this.rows.map(r => ({
      'userId': r.uid,
      'first name': r.firstName ? r.firstName : '--',
      'last name': r.lastName ? r.lastName : '--',
      'organization': r.org ? orgName(r.org) : '--',
      'org id': r.orgId ? r.orgId : '--',
      'type': r.type ? r.type : '--',
      'country': r.org && r.org.addresses.main.country ? r.org.addresses.main.country : '--',
      'role': r.userOrgRole ? r.userOrgRole : '--',
      'position': r.position ? r.position : '--',
      'email': r.email,
      'first connexion': r.firstConnexion ? r.firstConnexion : '--',
      'last connexion': r.lastConnexion ? r.lastConnexion : '--',
    }))
    downloadCsvFromJson(exportedRows, 'user-list');
  }

  private async getOrg(id: string): Promise<Organization> {
    if (!this.orgs[id]) {
      this.orgs[id] = await this.orgService.getValue(id);
    }

    return this.orgs[id];
  }

}
