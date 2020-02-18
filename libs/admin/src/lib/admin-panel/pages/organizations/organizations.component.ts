import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { getValue } from '@blockframes/utils/helpers';
import { OrganizationService } from '@blockframes/organization';

@Component({
  selector: 'admin-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.scss']
})
export class OrganizationsComponent implements OnInit {
  public versionColumns = {
    'id': 'Id',
    'status': 'Status',
    'logo': 'Logo',
    'name': 'Name',
    'email': 'Email',
    'appAccess': 'Authorizations',
    'edit': 'Edit',
  };

  public initialColumns: string[] = [
    'id',
    'logo',
    'name',
    'status',
    'email',
    'appAccess',
    'edit',
  ];
  public rows: any[] = [];
  constructor(
    private organizationService: OrganizationService,
    private cdRef: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    const orgs = await this.organizationService.getAllOrganizations();
    this.rows = orgs.map(o => {
      const org = {...o} as any;

      // Append new data for table display
      org.edit = {
        id: org.id,
        link: `/c/o/admin/panel/organization/${org.id}`,
      }

      return org;
    });
    this.cdRef.markForCheck();
  }

  filterPredicate(data: any, filter) {
    const columnsToFilter = [
      'id',
      'name',
      'status',
      'email',
    ];
    const dataStr = columnsToFilter.map(c => getValue(data, c)).join();
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }
  
}
