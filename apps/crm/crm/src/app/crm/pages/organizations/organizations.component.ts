import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { downloadCsvFromJson } from '@blockframes/utils/helpers';
import { OrganizationService } from '@blockframes/organization/service';
import { MatDialog } from '@angular/material/dialog';
import { OrganizationCreateComponent } from '../../components/organization/create-organization/create.component';
import { Organization, getAllAppsExcept, appName, modules } from '@blockframes/model';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { filters } from '@blockframes/ui/list/table/filters';
import { format } from 'date-fns';

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
    const exportedRows = orgs.map(r => {
      const row = {
        id: r.id,
        name: r.name,
        status: r.status,
        created: r._meta?.createdAt ? format(r._meta?.createdAt, 'MM/dd/yyyy') : '--',
        country: r.addresses.main.country ?? '--',
        email: r.email,
        memberCount: r.userIds.length,
        activity: r.activity ?? '--',
      }

      for (const a of this.apps) {
        for (const module of modules) {
          row[`${appName[a]} - ${module}`] = r.appAccess[a]?.[module] ? 'true' : 'false';
        }
      }

      return row;
    })
    downloadCsvFromJson(exportedRows, 'org-list');
  }

  createOrg() {
    this.dialog.open(OrganizationCreateComponent, { data: createModalData({}, 'large'), maxHeight: '80vh'});
  }

}
