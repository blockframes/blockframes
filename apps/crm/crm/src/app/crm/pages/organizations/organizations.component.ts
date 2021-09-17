import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { getValue, downloadCsvFromJson } from '@blockframes/utils/helpers';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { MatDialog } from '@angular/material/dialog';
import { OrganizationCreateComponent } from '../../components/organization/create-organization/create.component';
import { Organization } from '@blockframes/organization/+state';
import { getAllAppsExcept, appName, modules } from '@blockframes/utils/apps';
import { take } from 'rxjs/operators';

@Component({
  selector: 'crm-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationsComponent {
  editLink = org => [`/c/o/dashboard/crm/organization/${org.id}`];
  // public versionColumns = {
  //   'id': { value: 'Id', disableSort: true },
  //   'status': 'Status',
  //   'logo': { value: 'Logo', disableSort: true },
  //   'denomination.full': 'Company name',
  //   'denomination.public': 'Short name',
  //   'addresses.main.country': 'Country',
  //   'email': 'Email',
  //   'activity': 'Activity',
  //   'appAccess': { value: 'App  : Dashboard : Marketplace', disableSort: true }
  // };

  // public initialColumns: string[] = [
  //   'id',
  //   'logo',
  //   'denomination.full',
  //   'denomination.public',
  //   'addresses.main.country',
  //   'status',
  //   'activity',
  //   'email',
  //   'appAccess',
  // ];
  public orgs$ = this.service.valueChanges(ref => ref.limit(23)).pipe(take(1)).toPromise();
  public app = getAllAppsExcept(['crm']);

  constructor(
    private service: OrganizationService,
    private dialog: MatDialog,
    private router: Router
  ) { }

  goToEdit(org: Organization) {
    this.router.navigate([`/c/o/dashboard/crm/organization/${org.id}`]);
  }

  // public filterPredicate(data, filter: string) {
  //   const columnsToFilter = [
  //     'id',
  //     'denomination.full',
  //     'denomination.public',
  //     'addresses.main.country',
  //     'status',
  //     'email',
  //   ];
  //   const dataStr = columnsToFilter.map(c => getValue(data, c)).join();
  //   return dataStr.toLowerCase().indexOf(filter) !== -1;
  // }

  public exportTable(orgs: Organization[]) {
    const exportedRows = orgs.map(r => {
      const row = {
        id: r.id,
        fullDenomination: r.denomination.full,
        publicDenormination: r.denomination.public,
        status: r.status,
        country: r && r.addresses.main.country ? r.addresses.main.country : '--',
        email: r.email,
        memberCount: r.userIds.length,
        activity: r.activity ? r.activity : '--',
      }

      for (const a of this.app) {
        for (const module of modules) {
          row[`${appName[a]} - ${module}`] = !!r.appAccess[a] && r.appAccess[a][module] ? 'true' : 'false';
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
