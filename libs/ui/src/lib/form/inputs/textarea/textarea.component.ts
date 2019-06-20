import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';

@Component({
  selector: 'input-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextareaComponent  {

  @Input() form: FormGroup;
  @Input() type = 'text';
  @Input() placeholder = 'placeholder';
  @Input() name = 'default';
  @Input() matcher : ErrorStateMatcher;
  
  constructor() {}
}
