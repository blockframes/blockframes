import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { staticConsts } from '@blockframes/utils/static-model';

@Component({
  selector: '[fiscalNumber] [activity] organization-form-description',
  templateUrl: './organization-form-description.component.html',
  styleUrls: ['./organization-form-description.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationFormDescriptionComponent {
  activities = staticConsts.orgActivity;
  @Input() fiscalNumber: FormControl;
  @Input() activity: FormControl;

  constructor() { }

}
