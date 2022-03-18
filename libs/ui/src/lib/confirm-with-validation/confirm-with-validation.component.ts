import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'blockframes-confirm-validate',
  templateUrl: './confirm-with-validation.component.html',
  styleUrls: ['./confirm-with-validation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmWithValidationComponent {

  acceptTerms = new FormControl(false);
  termsPath = `/c/o/${this.router.url.includes('marketplace') ? 'marketplace' : 'dashboard'}/terms`;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string,
      question: string,
      confirm: string,
      cancel: string,
      onConfirm?: () => void
    },
    public router: Router,
    public dialogRef: MatDialogRef<ConfirmWithValidationComponent>,
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
