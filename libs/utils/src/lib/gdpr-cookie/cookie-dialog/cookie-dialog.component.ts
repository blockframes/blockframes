import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { CookiesConsentForm } from '../cookie-form/cookie.form';
import { PrivacyPolicyComponent } from '@blockframes/auth/components/privacy-policy/privacy-policy.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';

@Component({
  selector: 'cookie-dialog',
  templateUrl: 'cookie-dialog.component.html',
  styleUrls: ['./cookie-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CookieDialogComponent {

  form = new CookiesConsentForm();

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<CookieDialogComponent>,
  ) { }

  save() {
    this.dialogRef.close(this.form.value);
  }

  /** Opens a dialog with terms of use and privacy policy given by the parent. */
  public openPrivacyPolicy() {
    this.dialog.open(PrivacyPolicyComponent, {
      data: createModalData({ onClose: () => this.dialog.closeAll() }, 'large'),
      autoFocus: false
    });
  }
}
