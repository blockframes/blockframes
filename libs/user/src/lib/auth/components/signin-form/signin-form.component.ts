import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { SigninForm } from '../../forms/signin.form';

@Component({
  selector: 'auth-signin-form',
  templateUrl: './signin-form.component.html',
  styleUrls: ['./signin-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SigninFormComponent {
  @Output() submited = new EventEmitter();

  public signinForm = new SigninForm();
  public hidePassword : boolean = true;

  passwordVisibility(){
   return this.hidePassword = !this.hidePassword
  }
}
