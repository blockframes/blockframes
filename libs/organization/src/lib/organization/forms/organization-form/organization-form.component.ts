import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';
import { OrganizationService } from './../../service';
import { OrganizationForm } from '../../forms/organization.form';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { AlgoliaService } from '@blockframes/utils/algolia';

@Component({
  selector: '[form] organization-form',
  templateUrl: './organization-form.component.html',
  styleUrls: ['./organization-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationFormComponent {

  public orgId = this.service.org.id;
  @Input() form: OrganizationForm;

  @Input() @boolean disableCropper = false;

  constructor(
    private service: OrganizationService,
    private algoliaService: AlgoliaService,
    private cdr: ChangeDetectorRef
  ) { }

  public async uniqueOrgName() {
    const orgName = this.form.get('name').value.trim();
    const orgId = await this.algoliaService.getOrgIdFromName(orgName);
    if (orgId && orgId !== this.orgId) {
      this.form.get('name').setErrors({ notUnique: true });
      this.cdr.markForCheck();
    }
  }

  public change() {
    // user has selected & cropped an image to upload for his org logo
    // in order to let him click the "update" button we need to mark the form as dirty
    this.form.markAsDirty();
  }
}
