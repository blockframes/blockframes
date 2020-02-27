import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { getValue } from '@blockframes/utils/helpers';
import { OrganizationService } from '@blockframes/organization';
import { AuthService } from '@blockframes/auth/+state/auth.service';

@Component({
  selector: 'admin-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  public versionColumns = {
    'uid': 'Id',
    'avatar': 'Avatar',
    'name': 'Name',
    'surname': 'Surname',
    'org': 'Organization',
    'email': 'Email',
    'edit': 'Edit',
  };

  public initialColumns: string[] = [
    'uid',
    'avatar',
    'name',
    'surname',
    'org',
    'email',
    'edit',
  ];
  public rows: any[] = [];
  constructor(
    private authService: AuthService,
    private cdRef: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    const users = await this.authService.getAllUsers();
    this.rows = users.map(o => {
      const user = {...o} as any;

      // Append new data for table display
      user.edit = {
        id: user.uid,
        link: `/c/o/admin/panel/user/${user.uid}`,
      }

      user.org = {
        id: user.orgId,
        link: `/c/o/admin/panel/organization/${user.orgId}`,
      }
      return user;
    });
    this.cdRef.markForCheck();
  }

  filterPredicate(data: any, filter) {
    const columnsToFilter = [
      'id',
      'name',
      'surname',
      'email',
      'org',
    ];
    const dataStr = columnsToFilter.map(c => getValue(data, c)).join();
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }
  
}
