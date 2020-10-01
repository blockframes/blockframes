import { Component, ChangeDetectionStrategy } from '@angular/core';
// Blockframes
import { CookiesConsent, CookiesConsentForm } from './cookie.form';
import { PrivacyPolicyComponent } from '@blockframes/auth/components/privacy-policy/privacy-policy.component';
// Material
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatRadioChange } from '@angular/material/radio';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'cookie-form',
  templateUrl: './cookie-form.component.html',
  styleUrls: ['./cookie-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CookieFormComponent {

  form = new CookiesConsentForm();

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<any>,
  ) { 

  }

  masterToggle(event: MatRadioChange) {
    for (const key in this.form.controls) {
      this.form.get(key as keyof CookiesConsent).setValue(event.value);
    }
  }

  toggleCookie(event: MatSlideToggleChange) {
    this.form.get(event.source.name as keyof CookiesConsent).setValue(event.checked);
  }

  save() {
    this.dialogRef.close(this.form.value);
  }

  /** Opens a dialog with terms of use and privacy policy given by the parent. */
  public openPrivacyPolicy() {
    this.dialog.open(PrivacyPolicyComponent, { maxHeight: '80vh', maxWidth: '80vw' });
  }
}
