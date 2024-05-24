import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Holdback } from '@blockframes/model';

@Component({
  selector: 'holdback-modal',
  templateUrl: 'holdback-modal.component.html',
  styleUrls: ['./holdback-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HoldbackModalComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { holdbacks: Holdback[], withWarning?:boolean },
    public dialogRef: MatDialogRef<HoldbackModalComponent>
  ) { }

  close() {
    this.dialogRef.close()
  }
}
