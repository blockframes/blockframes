import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { OrganizationForm } from '@blockframes/organization/forms/organization.form';

@Component({
  selector: 'organization-form',
  templateUrl: './organization-form.component.html',
  styleUrls: ['./organization-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationFormComponent {

  constructor() {}

  @Input() form: OrganizationForm;

  get bankAccounts() {
    return this.form.get('bankAccounts');
  }
}
