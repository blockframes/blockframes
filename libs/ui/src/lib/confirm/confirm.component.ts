import { Component, ChangeDetectionStrategy, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'blockframes-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmComponent {

    public confirmEmitter= new EventEmitter();

    constructor(
      @Inject(MAT_DIALOG_DATA) public data:
        {
          title: string,
          question: string,
          button: string
        },
      public dialogRef: MatDialogRef<ConfirmComponent>,
      ) { }

    public confirm() {
      this.confirmEmitter.emit();
      this.close();
    }

    public close(): void {
      this.dialogRef.close();
    }
}
