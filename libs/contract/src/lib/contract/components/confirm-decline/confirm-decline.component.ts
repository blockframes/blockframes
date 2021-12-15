
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';

import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ConfirmDeclineData { forSeller: boolean }

@Component({
  selector: 'confirm-offer-decline',
  templateUrl: 'confirm-decline.component.html',
  styleUrls: ['./confirm-decline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDeclineComponent {
  reasons = [
    'The offer is not satisfactory',
    'The Title is not available',
    'Other'
  ];

  messageControl = new FormControl('')
  reasonControl = new FormControl('')

  constructor(
    private dialog: MatDialogRef<ConfirmDeclineComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDeclineData
  ) { }

  async declineContract(event: Event) {
    event.preventDefault(); // ensures page doesn't reloads
    const message = this.messageControl.value;
    const reason = this.reasonControl.value;
    const declineReason = reason ? `${reason} - ${message}` : message;
    this.dialog.close(declineReason);
  }

  async cancel() {
    this.dialog.close()
  }
}
