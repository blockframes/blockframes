import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'material-delivery-sign',
  templateUrl: './delivery-sign.component.html',
  styleUrls: ['./delivery-sign.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliverySignComponent {
  public form = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });
  public loading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data:
      {
        onConfirm: () => void
      },
    public dialogRef: MatDialogRef<DeliverySignComponent>,
    private snackBar: MatSnackBar,
    ) {}

  public sign() {
    this.data.onConfirm();
    this.snackBar.open('Delivery signed', 'close', { duration: 2000 });
    this.loading = false;
    this.close();
  }

  public confirm() {
    this.loading = true;
    setTimeout(() => this.sign(), 3000);
  }

  public close(): void {
    this.dialogRef.close();
  }

}
