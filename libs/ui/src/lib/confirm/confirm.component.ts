import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'blockframes-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmComponent {

  acceptTerms = new FormControl(false);

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string,
      question: string,
      confirm: string,
      cancel: string,
      showAcceptTermsCheckbox?: boolean,
      onConfirm?: () => void
    },
    public dialogRef: MatDialogRef<ConfirmComponent>,
  ) { }

  public confirm() {
    if (this.data.onConfirm) {
      this.data.onConfirm();
    }
    this.dialogRef.close(true);
  }

  public close(): void {
    this.dialogRef.close(false);
  }
}
