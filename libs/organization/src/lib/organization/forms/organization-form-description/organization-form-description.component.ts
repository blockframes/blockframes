import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { orgActivity } from '@blockframes/organization/+state';

@Component({
  selector: '[fiscalNumber] [activity] organization-form-description',
  templateUrl: './organization-form-description.component.html',
  styleUrls: ['./organization-form-description.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationFormDescriptionComponent {
  activities = orgActivity;
  @Input() fiscalNumber: FormControl;
  @Input() activity: FormControl;

  constructor() { }

}
