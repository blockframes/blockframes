import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'admin-form-dialog',
  templateUrl: './crm-form-dialog.component.html',
  styleUrls: ['./crm-form-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrmFormDialogComponent {

  public actionConfirm = new FormControl('');

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      question: string,
      warning?: string,
      confirmationWord: string,
      onConfirm?: () => void
    },
    public dialogRef: MatDialogRef<CrmFormDialogComponent>,
    private snackbar: MatSnackBar
  ) {}

  public confirm() {
    if (this.actionConfirm.value === this.data.confirmationWord.toUpperCase() && this.actionConfirm.valid) {
      this.data.onConfirm();
      this.dialogRef.close(true);
    }
    else {
      this.snackbar.open(`You didn't entered the excepted value. Action cancelled.`, 'close', { duration: 5000});
      this.dialogRef.close(false);
    }
  }

  public close() {
    this.dialogRef.close(false);
  }
}
