import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';

@Component({
  selector: 'input-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PasswordComponent  {

  @Input() form: FormGroup;
  @Input() name = 'password';
  @Input() showHint = true;
  @Input() placeholder = 'Password';
  @Input() matcher: ErrorStateMatcher;

  constructor() {}

  public get control() {
    return this.form.get(this.name);
  }

  public get controlExists() {
    return this.control.hasError('minLength') || this.control.hasError('maxLength') ? true : false;
  }

  public get minLength(): { requiredLength: number, actualLength: number } | undefined {
    if (!this.control.hasError('minLength') && !!this.control.errors) {
      return this.control.errors.minlength;
    }
  }

  public get maxLength(): { requiredLength: number, actualLength: number } | undefined {
    if (!this.control.hasError('maxLength') && !!this.control.errors) {
      return this.control.errors.maxlength;
    }
  }
}
