import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { orgActivity } from '@blockframes/model';

@Component({
  selector: '[activity] [description] organization-form-description',
  templateUrl: './organization-form-description.component.html',
  styleUrls: ['./organization-form-description.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationFormDescriptionComponent {
  activities = orgActivity;
  @Input() activity: UntypedFormControl;
  @Input() description: UntypedFormControl;

}
