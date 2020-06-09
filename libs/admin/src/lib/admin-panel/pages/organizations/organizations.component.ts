import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { getValue } from '@blockframes/utils/helpers';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';

@Component({
  selector: 'admin-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationsComponent implements OnInit {
  public versionColumns = {
    'id': 'Id',
    'status': 'Status',
    'logo': 'Logo',
    'denomination.full': 'Company name',
    'denomination.public': 'Short name',
    'email': 'Email',
    'appAccess': 'Authorizations',
    'edit': 'Edit',
  };

  public initialColumns: string[] = [
    'id',
    'logo',
    'denomination.full',
    'denomination.public',
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
    const orgs = await this.organizationService.getValue();
    this.rows = orgs.map(o => ({
      ...o,
      edit: {
        id: o.id,
        link: `/c/o/admin/panel/organization/${o.id}`,
      }
    }));

    this.cdRef.markForCheck();
  }

  public filterPredicate(data: any, filter: string) {
    const columnsToFilter = [
      'id',
      'denomination.full',
      'denomination.public',
      'status',
      'email',
    ];
    const dataStr = columnsToFilter.map(c => getValue(data, c)).join();
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

}
