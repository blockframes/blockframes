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
  @Input() showHint = true;
  @Input() name = 'password';
  @Input() placeholder = 'Password';
  @Input() matcher: ErrorStateMatcher;

  constructor() {}

  public get control() {
    return this.form.get(this.name);
  }

  public get minLength(): { requiredLength: number, actualLength: number } {
    return this.control.errors.minlength;
  }

  public get maxLength(): { requiredLength: number, actualLength: number } {
    return this.control.errors.maxlength;
  }
}
