import { Component, ChangeDetectionStrategy, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'blockframes-confirm-input',
  templateUrl: './confirm-input.component.html',
  styleUrls: ['./confirm-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmInputComponent implements OnInit {

  public actionConfirm = new FormControl('');
  public isValid = false;
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title?: string,
      subtitle?: string,
      text?: string,
      warning?: string,
      simulation?: string[],
      placeholder?: string,
      confirmationWord: string,
      confirmButtonText: string,
      cancelButtonText?: string,
      onConfirm?: () => void
    },
    public dialogRef: MatDialogRef<ConfirmInputComponent>,
    private snackbar: MatSnackBar
  ) {
    if (!this.data.cancelButtonText) { this.data.cancelButtonText = 'Cancel'; }
  }

  ngOnInit() {
    this.actionConfirm.valueChanges.subscribe(value => {
      if (this.data.confirmationWord.toUpperCase() === value && this.actionConfirm.valid) {
        this.isValid = true;
      } else {
        this.isValid = false;
      }
    });
  }

  public confirm() {
    if (this.isValid) {
      this.data.onConfirm();
      this.dialogRef.close(true);
    }
    else {
      this.snackbar.open(`You didn't entered the excepted value. Action cancelled.`, 'close', { duration: 5000 });
      this.dialogRef.close(false);
    }
  }

  public close() {
    this.dialogRef.close(false);
  }
}
