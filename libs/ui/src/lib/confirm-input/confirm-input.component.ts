import { Component, ChangeDetectionStrategy, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import type { View } from '@blockframes/ui/modal/form/form.component';

interface FormData {
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
}

interface Data {
  view?: View,
  formData: FormData
}

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
    public data: Data,
    public dialogRef: MatDialogRef<ConfirmInputComponent>,
    private snackbar: MatSnackBar
  ) {
    if (!this.data.formData.cancelButtonText) { this.data.formData.cancelButtonText = 'Cancel'; }
  }

  ngOnInit() {
    this.actionConfirm.valueChanges.subscribe(value => {
      if (this.data.formData.confirmationWord.toUpperCase() === value && this.actionConfirm.valid) {
        this.isValid = true;
      } else {
        this.isValid = false;
      }
    });
  }

  public confirm() {
    if (this.isValid) {
      this.data.formData.onConfirm();
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
