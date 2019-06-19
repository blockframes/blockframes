import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'email-form-field',
  templateUrl: './email-form-field.component.html',
  styleUrls: ['./email-form-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailFormFieldComponent  {

  @Input() form: FormGroup;

  constructor() {}
}
