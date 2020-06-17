import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CookiesConsent, CookiesConsentForm } from './cookie.form';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatRadioChange } from '@angular/material/radio';
import { MatDialog } from '@angular/material/dialog';
import { PrivacyPolicyComponent } from '@blockframes/auth/components/privacy-policy/privacy-policy.component';

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
  ) { }

  masterToggle(event: MatRadioChange) {
    this.form.patchAllValue(event.value);
    Object.keys(this.form.controls)
      .forEach(controlName => this.form.get(controlName as keyof CookiesConsent).setValue(event.value));
  }

  toggleCookie(event: MatSlideToggleChange) {
    this.form.get(event.source.name as keyof CookiesConsent).setValue(event.checked);
  }

  save() {
    console.log('save'); // TODO DISABLE EVERY 3RD PARTIES IF NEEDED
  }

  /** Opens a dialog with terms of use and privacy policy given by the parent. */
  public openPrivacyPolicy() {
    this.dialog.open(PrivacyPolicyComponent, { maxHeight: '80vh' })
  }
}
