import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { SignupForm } from '../../forms/signup.form';
import { slideUp, slideDown } from '@blockframes/utils/animations/fade';

@Component({
  selector: 'auth-signup-form',
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.scss'],
  animations: [slideUp, slideDown],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupFormComponent {
  @Output() opened = new EventEmitter();
  @Output() submited = new EventEmitter();

  public signupForm = new SignupForm();
  public clicked = false;

  onSubmit(signupForm) {
    if (this.signupForm.valid) {
      this.clicked = true;
      this.submited.emit(signupForm);
    }
  }
}
