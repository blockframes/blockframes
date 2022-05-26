import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationForm } from '@blockframes/organization/forms/organization.form';
import { OrganizationService } from '@blockframes/organization/service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FileUploaderService } from '@blockframes/media/file-uploader.service';
import { SnackbarErrorComponent } from '@blockframes/ui/snackbar/error/snackbar-error.component';

@Component({
  selector: 'organization-edit',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationComponent implements OnInit {
  public organizationForm: OrganizationForm;

  constructor(
    private service: OrganizationService,
    private snackBar: MatSnackBar,
    private uploaderService: FileUploaderService,
  ) { }

  ngOnInit() {
    this.organizationForm = new OrganizationForm(this.service.org);
  }

  public update() {
    try {
      if (this.organizationForm.dirty) {
        if (this.organizationForm.invalid) {
          throw new Error('Your organization profile information are not valid');
        }
        this.uploaderService.upload();
        const org = this.service.cleanOrganization(this.organizationForm.value);
        this.service.update(this.service.org.id, org);
        this.snackBar.open('Organization Profile updated.', 'close', { duration: 4000 });
      }
    } catch (error) {
      if (error.message === 'Your organization profile information are not valid') {
        this.snackBar.open(error.message, 'close', { duration: 2000 });
      } else {
        this.snackBar.openFromComponent(SnackbarErrorComponent, { duration: 5000 });
      }
    }
  }

}
