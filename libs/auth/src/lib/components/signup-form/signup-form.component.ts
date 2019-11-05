import { Component, Output, EventEmitter, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { SignupForm } from '../../forms/signup.form';
import { PrivacyPageComponent } from 'apps/catalog/marketplace/marketplace/src/app/pages/privacy-page/privacy-page.component';
import { MatDialog } from '@angular/material/dialog';

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
  public isTermOfUseChedked = false;

  constructor(private dialog: MatDialog) {}

  public openConditions() {
    this.dialog.open(PrivacyPageComponent, { maxHeight: '100vh' })
  }

  public checkTermsOfUse() {
    this.isTermOfUseChedked = !this.isTermOfUseChedked;
  }
}
