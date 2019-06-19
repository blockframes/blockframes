import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';

@Component({
  selector: 'string-form-field',
  templateUrl: './string-form-field.component.html',
  styleUrls: ['./string-form-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StringFormFieldComponent  {

  @Input() form: FormGroup;
  @Input() type = 'text';
  @Input() placeholder = 'placeholder';
  @Input() name = 'default';
  @Input() required = false;
  @Input() matcher : ErrorStateMatcher;
  @Input() class = '';

  constructor() {}
}
