import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'cell-modal',
  templateUrl: 'cell-modal.component.html',
  styleUrls: ['./cell-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CellModalComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { title: string, values: string[] },
    public dialogRef: MatDialogRef<CellModalComponent>
  ) { }

  close() {
    this.dialogRef.close()
  }
}
