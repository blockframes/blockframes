import { Component, Output, EventEmitter, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { SignupForm } from '../../forms/signup.form';

@Component({
  selector: 'auth-signup-form',
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SignupFormComponent {
  @HostBinding('attr.page-id') pageId = 'signup-form';
  @Output() opened = new EventEmitter();
  @Output() submited = new EventEmitter();

  public signupForm = new SignupForm();
}
