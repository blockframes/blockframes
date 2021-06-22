import { Component, ChangeDetectionStrategy, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'admin-form-dialog',
  templateUrl: './crm-form-dialog.component.html',
  styleUrls: ['./crm-form-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrmFormDialogComponent implements OnInit {

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
      confirmationWord: string,
      confirmButtonText: string,
      onConfirm?: () => void
    },
    public dialogRef: MatDialogRef<CrmFormDialogComponent>,
    private snackbar: MatSnackBar
  ) { }

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
