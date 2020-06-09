import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { getValue, downloadCsvFromJson } from '@blockframes/utils/helpers';
import { UserService } from '@blockframes/user/+state/user.service';
import { AdminService } from '@blockframes/admin/admin/+state/admin.service';
import { AdminQuery } from '@blockframes/admin/admin/+state/admin.query';

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
    'position',
    'email',
    'firstConnexion',
    'lastConnexion',
    'edit',
  ];
  public rows: any[] = [];
  public userListLoaded = false;

  constructor(
    private userService: UserService,
    private cdRef: ChangeDetectorRef,
    private adminService: AdminService,
    private adminQuery: AdminQuery,
  ) { }

  async ngOnInit() {
    // @TODO (#2952) Move to a guard if stats are needed on another pages
    await this.adminService.loadAnalyticsData();

    const users = await this.userService.getAllUsers();
    this.rows = users.map(u => ({
      ...u,
      firstConnexion: this.adminQuery.getFirstConnexion(u.uid),
      lastConnexion: this.adminQuery.getLastConnexion(u.uid),
      edit: {
        id: u.uid,
        link: `/c/o/admin/panel/user/${u.uid}`,
      },
      org: {
        id: u.orgId,
        link: `/c/o/admin/panel/organization/${u.orgId}`,
      }
    }));

    this.userListLoaded = true;
    this.cdRef.markForCheck();
  }

  public filterPredicate(data: any, filter: string) {
    const columnsToFilter = [
      'id',
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
      uid: r.uid,
      firstName: r.firstName,
      lastName: r.lastName,
      orgId: r.orgId,
      position: r.position,
      email: r.email,
      firstConnexion: r.firstConnexion,
      lastConnexion: r.lastConnexion,
    }))
    downloadCsvFromJson(exportedRows, 'user-list');
  }

}
