
import { AfterViewInit, ChangeDetectionStrategy, Component, Inject } from '@angular/core';

import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ConfirmDeclineData { forSeller: boolean }

@Component({
  selector: 'confirm-offer-decline',
  templateUrl: 'confirm-decline.component.html',
  styleUrls: ['./confirm-decline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDeclineComponent implements AfterViewInit {
  sellerReason = [
    'The offer is not satisfactory',
    'The Title is not available',
    'Other'
  ];

  buyerReason = [
    'The offer is not satisfactory',
    'I found another Title for this timeframe',
    'Other'
  ];

  reasons = this.buyerReason;


  form = new FormGroup({
    reason: new FormControl(''),
    message: new FormControl(''),
  });

  constructor(
    private dialog: MatDialogRef<ConfirmDeclineComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDeclineData
  ) { }

  ngAfterViewInit(): void {
    if (this.data.forSeller) this.reasons = this.sellerReason;
  }

  async decline() {
    event.preventDefault(); // ensures page doesn't reloads
    const { message, reason } = this.form.value;
    if (reason && message) return this.dialog.close(`${reason} - ${message}`);
    if (reason) return this.dialog.close(reason);
    return this.dialog.close(message);
  }

  async cancel() {
    this.dialog.close()
  }
}
