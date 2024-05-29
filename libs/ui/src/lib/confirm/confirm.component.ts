import { Component, ChangeDetectionStrategy, Inject, Optional } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { Intercom } from 'ng-intercom';

interface ConfirmationData {
  title: string,
  question: string,
  advice?: string,
  intercom?: string,
  additionalData?: string[],
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
    @Optional() private intercom: Intercom,
  ) { }

  public confirm() {
    if (this.data.onConfirm) this.data.onConfirm();
    this.dialogRef.close(true);
  }

  public close(): void {
    if (this.data.onClose) this.data.onClose('button');
    this.dialogRef.close(false);
  }

  public openIntercom() {
    return this.intercom.show();
  }
}
