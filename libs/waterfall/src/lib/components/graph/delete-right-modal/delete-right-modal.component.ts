
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';


export interface DeleteRightModalData {
  rightName: string;
  onConfirm?: () => void;
};

@Component({
  selector: 'waterfall-delete-right-modal',
  templateUrl: './delete-right-modal.component.html',
  styleUrls: ['./delete-right-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WaterfallDeleteRightModalComponent {

  rightNameControl = new FormControl('');

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DeleteRightModalData,
    private dialogRef: MatDialogRef<WaterfallDeleteRightModalComponent>,
  ) {  }

  remove() {
    if (this.data.rightName !== this.rightNameControl.value) return;
    this.data.onConfirm();
    this.dialogRef.close(true);
  }

  close() {
    this.dialogRef.close(false);
  }
}
