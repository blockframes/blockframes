import { Component, Output, EventEmitter, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { SigninForm } from '../../forms/signin.form';

@Component({
  selector: 'auth-login-form',
  templateUrl: './signin-form.component.html',
  styleUrls: ['./signin-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SigninFormComponent implements OnInit {
  @Output() opened = new EventEmitter();
  @Output() submited = new EventEmitter();

  public signinForm: SigninForm;

  ngOnInit() {
    this.signinForm = new SigninForm();
  }
}
