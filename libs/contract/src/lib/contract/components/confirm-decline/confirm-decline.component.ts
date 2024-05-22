
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';

import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { ModuleGuard } from '@blockframes/utils/routes/module.guard';

export interface ConfirmDeclineData { 
  type: 'seller' | 'buyer', 
  showAcceptTermsCheckbox?: boolean 
}

@Component({
  selector: 'confirm-offer-decline',
  templateUrl: 'confirm-decline.component.html',
  styleUrls: ['./confirm-decline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDeclineComponent {
  reasons = {
    seller: [
      'The offer is not satisfactory',
      'The Title is not available',
      'Other'
    ],
    buyer: [
      'The offer is not satisfactory',
      'I found another Title for this timeframe',
      'Other'
    ]
  };

  form = new UntypedFormGroup({
    reason: new UntypedFormControl(''),
    message: new UntypedFormControl(''),
    acceptTerms: new UntypedFormControl(false)
  });

  termsPath = `/c/o/${this.moduleGuard.currentModule}/terms`;

  constructor(
    private dialog: MatDialogRef<ConfirmDeclineComponent>,
    private moduleGuard: ModuleGuard,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDeclineData
  ) { }

  async decline() {
    const { message, reason } = this.form.value;
    if (reason && message) return this.dialog.close(`${reason} - ${message}`);
    if (reason) return this.dialog.close(reason);
    return this.dialog.close(message);
  }

  async cancel() {
    this.dialog.close();
  }
}
