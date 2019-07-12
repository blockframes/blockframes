import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { SignupForm } from '../../forms/signup.form';

@Component({
  selector: 'auth-invitation',
  templateUrl: './invitation-view.component.html',
  styleUrls: ['./invitation-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class InvitationViewComponent {
  @Output() opened = new EventEmitter();
  @Output() submited = new EventEmitter();

  public signupForm = new SignupForm();
}
