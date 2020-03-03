import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { getValue } from '@blockframes/utils/helpers';
import { AuthService } from '@blockframes/auth/+state/auth.service';

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
    'name': 'Name',
    'surname': 'Surname',
    'org': 'Organization',
    'position': 'Position',
    'email': 'Email',
    'edit': 'Edit',
  };

  public initialColumns: string[] = [
    'uid',
    'avatar',
    'name',
    'surname',
    'org',
    'position',
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
    this.rows = users.map(u => ({
      ...u,
      edit: {
        id: u.uid,
        link: `/c/o/admin/panel/user/${u.uid}`,
      },
      org: {
        id: u.orgId,
        link: `/c/o/admin/panel/organization/${u.orgId}`,
      }
    }));
    this.cdRef.markForCheck();
  }

  public filterPredicate(data: any, filter: string) {
    const columnsToFilter = [
      'id',
      'name',
      'surname',
      'email',
      'position',
      'org',
    ];
    const dataStr = columnsToFilter.map(c => getValue(data, c)).join();
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

}
