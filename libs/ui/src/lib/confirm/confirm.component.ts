import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface ConfirmationData {
  title: string,
  question: string,
  advice?: string,
  confirm: string,
  cancel: string,
  onConfirm?: () => void,
  onClose?: (closedFrom: 'button') => void,
}

@Component({
  selector: 'blockframes-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: ConfirmationData,
    public dialogRef: MatDialogRef<ConfirmComponent>,
  ) { }

  public confirm() {
    if (this.data.onConfirm) this.data.onConfirm();
    this.dialogRef.close(true);
  }

  public close(): void {
    if (this.data.onClose) this.data.onClose('button');
    this.dialogRef.close(false);
  }
}
