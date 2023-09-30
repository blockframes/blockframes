import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { downloadCsvFromJson } from '@blockframes/utils/helpers';
import { OrganizationService } from '@blockframes/organization/service';
import { MatDialog } from '@angular/material/dialog';
import { OrganizationCreateComponent } from '../../components/organization/create-organization/create.component';
import { Organization, getAllAppsExcept, OrgsToExport } from '@blockframes/model';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { filters } from '@blockframes/ui/list/table/filters';

@Component({
  selector: 'crm-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationsComponent {
  public orgs$ = this.service.valueChanges();
  public apps = getAllAppsExcept(['crm']);
  public filters = filters;

  constructor(
    private service: OrganizationService,
    private dialog: MatDialog,
    private router: Router
  ) { }


  goToEdit(org: Organization) {
    this.router.navigate([`/c/o/dashboard/crm/organization/${org.id}`]);
  }

  public exportTable(orgs: Organization[]) {
    const rows = OrgsToExport(orgs, 'csv');
    downloadCsvFromJson(rows, 'org-list');
  }

  createOrg() {
    this.dialog.open(OrganizationCreateComponent, { data: createModalData({}, 'large'), maxHeight: '80vh'});
  }
}
