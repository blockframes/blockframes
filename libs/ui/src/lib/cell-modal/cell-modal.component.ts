import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

@Component({
  selector: 'cellmodal',
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
    this.dialogRef.close();
  }
}
