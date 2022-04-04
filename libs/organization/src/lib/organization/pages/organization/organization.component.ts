import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationForm } from '@blockframes/organization/forms/organization.form';
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
        this.service.update(this.service.org.id, this.organizationForm.value);

        this.snackBar.open('Organization Profile updated.', 'close', { duration: 4000 });
      }
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

}
