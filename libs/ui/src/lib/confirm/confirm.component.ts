import { Component, ChangeDetectionStrategy, Inject, HostBinding } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'blockframes-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmComponent {
    @HostBinding('attr.page-id') pageId = 'confirm-modal';

    constructor(
      @Inject(MAT_DIALOG_DATA)
      public data:
        {
          title: string,
          question: string,
          buttonName: string,
          onConfirm: () => void
        },
      public dialogRef: MatDialogRef<ConfirmComponent>,
      ) {}

    public confirm() {
      this.data.onConfirm();
      this.close();
    }

    public close(): void {
      this.dialogRef.close();
    }
}
