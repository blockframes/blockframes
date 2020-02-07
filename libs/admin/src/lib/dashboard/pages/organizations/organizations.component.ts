import { Component, OnInit } from '@angular/core';
import { getValue, cleanModel } from '@blockframes/utils/helpers';
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
    'edit': 'Edit',
  };

  public initialColumns: string[] = [
    'id',
    'logo',
    'name',
    'status',
    'email',
    'edit',
  ];
  public rows: any[] = [];
  constructor(
    private organizationService: OrganizationService,
  ) { }

  async ngOnInit() {
    const orgs = await this.organizationService.getAllOrganizations();
    this.rows = orgs.map(o => {
      const org = cleanModel({...o}) as any;

      org.edit = {
        id: org.id,
        link: `/c/o/admin/dashboard/organization/${org.id}`,
      }

      return org;
    });

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
