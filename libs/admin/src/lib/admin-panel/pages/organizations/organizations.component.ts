import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { getValue, downloadCsvFromJson } from '@blockframes/utils/helpers';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { MatDialog } from '@angular/material/dialog';
import { OrganizationCreateComponent } from '../../components/organization/create-organization/create.component';
import { Organization } from '@blockframes/organization/+state';
import { appName, modules } from '@blockframes/utils/apps';

@Component({
  selector: 'admin-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationsComponent implements OnInit {
  public versionColumns = {
    'id': { value: 'Id', disableSort: true },
    'status': 'Status',
    'logo': { value: 'Logo', disableSort: true },
    'denomination.full': 'Company name',
    'denomination.public': 'Short name',
    'addresses.main.country': 'Country',
    'email': 'Email',
    'appAccess': { value: 'Authorizations', disableSort: true }
  };

  public initialColumns: string[] = [
    'id',
    'logo',
    'denomination.full',
    'denomination.public',
    'addresses.main.country',
    'status',
    'email',
    'appAccess',
  ];
  public rows: Organization[] = [];
  public orgListLoaded = false;

  constructor(
    private organizationService: OrganizationService,
    private cdRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private router: Router
  ) { }

  async ngOnInit() {
    this.rows = await this.organizationService.getValue();
    this.orgListLoaded = true;
    this.cdRef.markForCheck();
  }

  goToEdit(org: Organization) {
    this.router.navigate([`/c/o/admin/panel/organization/${org.id}`]);
  }

  public filterPredicate(data: any, filter: string) {
    const columnsToFilter = [
      'id',
      'denomination.full',
      'denomination.public',
      'addresses.main.country',
      'status',
      'email',
    ];
    const dataStr = columnsToFilter.map(c => getValue(data, c)).join();
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

  public exportTable() {
    const exportedRows = this.rows.map(r => {
      const row = {
        id: r.id,
        fullDenomination: r.denomination.full,
        publicDenormination: r.denomination.public,
        status: r.status,
        country: r && r.addresses.main.country ? r.addresses.main.country : '--',
        email: r.email,
        memberCount: r.userIds.length,
        activity: !!r.activity ? r.activity : '--',
      }

      for (const app in r.appAccess) {
        for (const module of modules) {
          row[`${appName[app]} - ${module}`] = r.appAccess[app][module] ? 'true' : 'false';
        }
      }

      return row;
    })
    downloadCsvFromJson(exportedRows, 'org-list');
  }

  createOrg() {
    this.dialog.open(OrganizationCreateComponent, {
      height: '80vh',
      width: '60vw',
    });
  }

}
