import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { SignupForm } from '../../forms/signup.form';

@Component({
  selector: 'auth-signup-form',
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignupFormComponent {
  @Output() opened = new EventEmitter();
  @Output() submited = new EventEmitter();

  public signupForm = new SignupForm();
  public isTermsChecked: boolean;

  /** Check the value of the boolean outputed by TermsAndConditionsComponent */
  public checkTermsOfUse(checked: boolean) {
    this.isTermsChecked = checked;
  }
}
