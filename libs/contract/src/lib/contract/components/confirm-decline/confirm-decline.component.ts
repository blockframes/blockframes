
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';

import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
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

  form = new FormGroup({
    reason: new FormControl(''),
    message: new FormControl(''),
    acceptTerms: new FormControl(false)
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
