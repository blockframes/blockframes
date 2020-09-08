import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { getValue, downloadCsvFromJson } from '@blockframes/utils/helpers';
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
    'companyName': 'Company name',
    'shortName': 'Short name',
    'country': 'Country',
    'email': 'Email',
    'appAccess': 'Authorizations',
    'edit': 'Edit',
  };

  public initialColumns: string[] = [
    'id',
    'logo',
    'companyName',
    'shortName',
    'country',
    'status',
    'email',
    'appAccess',
    'edit',
  ];
  public rows: any[] = [];
  public orgListLoaded = false;

  constructor(
    private organizationService: OrganizationService,
    private cdRef: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    const orgs = await this.organizationService.getValue();
    this.rows = orgs.map(o => ({
      'id': o.id,
      'status': o.status,
      'logo': o.logo,
      'email': o.email,
      'companyName': o.denomination.full,
      'shortName': o.denomination.public,
      'country': o.addresses.main.country,
      'appAccess': o.appAccess,
      edit: {
        id: o.id,
        link: `/c/o/admin/panel/organization/${o.id}`,
      }
    }));
    this.orgListLoaded = true;
    this.cdRef.markForCheck();
  }

  public filterPredicate(data: any, filter: string) {
    const columnsToFilter = [
      'id',
      'companyName',
      'shortName',
      'country',
      'status',
      'email',
    ];
    const dataStr = columnsToFilter.map(c => getValue(data, c)).join();
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

  public exportTable() {
    const exportedRows = this.rows.map(r => ({
      id: r.id,
      fullDenomination: r.denomination.full,
      publicDenormination: r.denomination.public,
      status: r.status,
      country: r && r.addresses.main.country ? r.addresses.main.country : '--',
      email: r.email,
      catalog: `dashboard: ${r.appAccess.catalog.dashboard ? 'yes' : 'no'} - marketplace: ${r.appAccess.catalog.marketplace ? 'yes' : 'no'}`,
      festival: `dashboard: ${r.appAccess.festival.dashboard ? 'yes' : 'no'} - marketplace: ${r.appAccess.festival.marketplace ? 'yes' : 'no'}`
    }))
    downloadCsvFromJson(exportedRows, 'org-list');
  }

}
