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
  public isTermsOfUseChecked = false;

  constructor(private dialog: MatDialog) {}

  /** Opens a dialog with terms of use and privacy policy. */
  // Create a reusable component for Term of use checkbox and dialog => ISSUE #1233
  public openTermsOfUse() {
    this.dialog.open(PrivacyPageComponent, { maxHeight: '100vh' })
  }

  public toggleTermsOfUse() {
    this.isTermsOfUseChecked = !this.isTermsOfUseChecked;
  }
}
