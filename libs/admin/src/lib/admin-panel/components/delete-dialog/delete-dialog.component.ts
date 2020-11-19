import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'admin-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeleteDialogComponent {

  public deleteConfirm = new FormControl('');

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      document: string,
      onConfirm?: () => void
    },
    public dialogRef: MatDialogRef<DeleteDialogComponent>,
    private snackbar: MatSnackBar
  ) {}

  public confirm() {
    if (this.deleteConfirm.value === 'Delete' && this.deleteConfirm.valid) {
      this.data.onConfirm();
      this.dialogRef.close(true);
    }
    if (this.deleteConfirm.value !== 'Delete' || this.deleteConfirm.invalid) {
      this.snackbar.open(`You can\'t delete this ${this.data.document}`, 'close', { duration: 5000});
      this.dialogRef.close(false);
    }
  }

  public close() {
    this.dialogRef.close(false);
  }
}
