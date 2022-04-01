import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { downloadCsvFromJson } from '@blockframes/utils/helpers';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { MatDialog } from '@angular/material/dialog';
import { OrganizationCreateComponent } from '../../components/organization/create-organization/create.component';
import { Movie, Organization } from '@blockframes/shared/model';
import { getAllAppsExcept, appName, modules } from '@blockframes/utils/apps';

@Component({
  selector: 'crm-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationsComponent {
  public orgs$ = this.service.valueChanges();
  public app = getAllAppsExcept(['crm']);

  constructor(private service: OrganizationService, private dialog: MatDialog, private router: Router) {}

  goToEdit(org: Organization) {
    this.router.navigate([`/c/o/dashboard/crm/organization/${org.id}`]);
  }

  public exportTable(orgs: Organization[]) {
    const exportedRows = orgs.map(r => {
      const row = {
        id: r.id,
        fullDenomination: r.denomination.full,
        publicDenormination: r.denomination.public,
        status: r.status,
        country: r.addresses.main.country ?? '--',
        email: r.email,
        memberCount: r.userIds.length,
        activity: r.activity ?? '--',
      };

      for (const a of this.app) {
        for (const module of modules) {
          row[`${appName[a]} - ${module}`] = r.appAccess[a]?.[module] ? 'true' : 'false';
        }
      }

      return row;
    });
    downloadCsvFromJson(exportedRows, 'org-list');
  }

  createOrg() {
    this.dialog.open(OrganizationCreateComponent, {
      height: '80vh',
      width: '60vw',
    });
  }
}
