import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationForm } from '@blockframes/organization/forms/organization.form';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { extractMedia } from '@blockframes/media/+state/media.model';
import { MediaService } from '@blockframes/media/+state/media.service';

@Component({
  selector: 'organization-edit',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationComponent implements OnInit {
  public organizationForm;

  constructor(
    private query: OrganizationQuery,
    private service: OrganizationService,
    private snackBar: MatSnackBar,
    private media: MediaService
  ) { }

  ngOnInit() {
    const organization = this.query.getActive();
    this.organizationForm = new OrganizationForm(organization);
  }

  public update() {
    try {
      if (this.organizationForm.dirty) {
        if (this.organizationForm.invalid) {
          throw new Error('Your organization profile informations are not valid');
        }
        const [ org, media ] = extractToBeUpdatedMedia(this.organizationForm.value);
        this.media.uploadOrDeleteMedia(media);
        this.service.update(this.query.getActiveId(), org);
        this.snackBar.open('Organization profile was successfully changed', 'close', { duration: 2000 });
      }
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

}
