import { Component, ChangeDetectionStrategy, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { OrganizationService } from './../../+state/organization.service';
import { OrganizationForm } from '@blockframes/organization/forms/organization.form';
import { boolean } from '@blockframes/utils/decorators/decorators';

@Component({
  selector: '[form] organization-form',
  templateUrl: './organization-form.component.html',
  styleUrls: ['./organization-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationFormComponent implements OnInit {

  public orgId = this.service.org.id;
  private currentOrgName: string;
  @Input() form: OrganizationForm;

  @Input() @boolean disableCropper = false;

  constructor(
    private service: OrganizationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.currentOrgName = this.form.get('denomination').get('full').value.trim();
  }

  public async uniqueOrgName() {
    const orgName = this.form.get('denomination').get('full').value.trim();
    const unique = await this.service.uniqueOrgName(orgName);
    if (!unique && orgName !== this.currentOrgName) {
      this.form.get('denomination').get('full').setErrors({ notUnique: true });
      this.cdr.markForCheck();
    }
  }

  public change() {
    // user has selected & cropped an image to upload for his org logo
    // in order to let him click the "update" button we need to mark the form as dirty
    this.form.markAsDirty();
  }
}
