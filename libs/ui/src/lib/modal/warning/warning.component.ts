import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface Data {
  title: string,
  text: string,
  secondaryText?: string,
  confirm: string,
  cancel: string,
  onConfirm?: () => void
}

@Component({
  selector: 'warning-modal',
  templateUrl: './warning.component.html',
  styleUrls: ['./warning.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarningModalComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: Data,
    public dialogRef: MatDialogRef<WarningModalComponent>,
  ) { }

  public confirm() {
    if (this.data.onConfirm) this.data.onConfirm();
    this.dialogRef.close(true);
  }

  public close(): void {
    this.dialogRef.close(false);
  }
}
