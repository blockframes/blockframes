import { Component, Output, EventEmitter, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { SigninForm } from '../../forms/signin.form';

@Component({
  selector: 'auth-login-form',
  templateUrl: './signin-form.component.html',
  styleUrls: ['./signin-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SigninFormComponent {
  @HostBinding('attr.page-id') pageId = 'signin-form';
  @Output() opened = new EventEmitter();
  @Output() submited = new EventEmitter();

  public signinForm = new SigninForm();
}
