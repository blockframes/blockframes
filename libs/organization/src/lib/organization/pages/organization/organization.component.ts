import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationForm } from '@blockframes/organization/forms/organization.form';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FileUploaderService } from '@blockframes/media/+state';

@Component({
  selector: 'organization-edit',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationComponent implements OnInit {
  public organizationForm: OrganizationForm;

  constructor(
    private query: OrganizationQuery,
    private service: OrganizationService,
    private snackBar: MatSnackBar,
    private uploaderService: FileUploaderService,
  ) { }

  ngOnInit() {
    const organization = this.query.getActive();
    this.organizationForm = new OrganizationForm(organization);
  }

  public update() {
    try {
      if (this.organizationForm.dirty) {
        if (this.organizationForm.invalid) {
          throw new Error('Your organization profile information are not valid');
        }

        this.uploaderService.upload();
        this.service.update(this.query.getActiveId(), this.organizationForm.value);

        this.snackBar.open('Organization profile was successfully changed', 'close', { duration: 2000 });
      }
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

}
