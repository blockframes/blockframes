import { Component, Output, EventEmitter, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { SignupForm } from '../../forms/signup.form';

@Component({
  selector: 'auth-signup-form',
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SignupFormComponent implements OnInit {
  @Output() opened = new EventEmitter();
  @Output() submited = new EventEmitter();

  public signupForm: SignupForm;

  ngOnInit() {
    this.signupForm = new SignupForm();
  }
}
