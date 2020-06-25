import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationForm } from '@blockframes/organization/forms/organization.form';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { MatSnackBar } from '@angular/material/snack-bar';
// import { extractToBeUpdatedMedia } from '@blockframes/media/+state/media.model';
import { MediaService } from '@blockframes/media/+state/media.service';
import { HostedMediaForm } from '@blockframes/media/directives/media/media.form';

@Component({
  selector: 'organization-edit',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationComponent implements OnInit {
  public organizationForm: OrganizationForm;
  public hostedMediaForm: HostedMediaForm;

  constructor(
    private query: OrganizationQuery,
    private service: OrganizationService,
    private snackBar: MatSnackBar,
    private mediaService: MediaService
  ) { }

  ngOnInit() {
    const organization = this.query.getActive();
    this.organizationForm = new OrganizationForm(organization);
    this.hostedMediaForm = new HostedMediaForm(organization.logo.original);
  }

  public update() {
    try {
      if (this.organizationForm.dirty || this.hostedMediaForm.dirty) {
        if (this.organizationForm.invalid) {
          throw new Error('Your organization profile informations are not valid');
        }

        this.service.update(this.query.getActiveId(), this.organizationForm.value);
        this.mediaService.uploadOrDeleteMedia([this.hostedMediaForm]);

        this.snackBar.open('Organization profile was successfully changed', 'close', { duration: 2000 });
      }
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

}
