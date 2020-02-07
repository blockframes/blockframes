import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { OrganizationService, Organization, OrganizationStatus } from '@blockframes/organization';
import { ActivatedRoute } from '@angular/router';
import { OrganizationAdminForm } from '../../forms/organization-admin.form';
import { MatSnackBar } from '@angular/material';


@Component({
  selector: 'admin-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationComponent implements OnInit {
  public orgId = '';
  private org: Organization;
  public orgForm: OrganizationAdminForm;
  public statuses: string[];

  constructor(
    private organizationService: OrganizationService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) { }

  async ngOnInit() {
    this.orgId = this.route.snapshot.paramMap.get('orgId');
    this.org = await this.organizationService.getValue(this.orgId);
    this.orgForm = new OrganizationAdminForm(this.org);

    this.statuses = Object.keys(OrganizationStatus);
    this.cdRef.detectChanges();
  }

  public async update() {
    if (this.orgForm.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 5000 });
      return;
    }

    const update = {
      status : this.orgForm.get('status').value,
      appAccess : {
        catalogDashboard : this.orgForm.get('catalogDashboard').value,
        catalogMarketplace : this.orgForm.get('catalogMarketplace').value,
      }
    }

    await this.organizationService.update(this.orgId, update);

    this.snackBar.open('Informations updated !', 'close', { duration: 5000 });
  }

}
