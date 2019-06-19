import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';

@Component({
  selector: 'textarea-form-field',
  templateUrl: './textarea-form-field.component.html',
  styleUrls: ['./textarea-form-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextareaFormFieldComponent  {

  @Input() form: FormGroup;
  @Input() type = 'text';
  @Input() placeholder = 'placeholder';
  @Input() name = 'default';
  @Input() matcher : ErrorStateMatcher;

  constructor() {}
}
