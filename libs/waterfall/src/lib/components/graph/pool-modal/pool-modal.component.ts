
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';

import { Right } from '@blockframes/model';


export interface PoolModalData {
  rights: Right[];
  selected: Set<string>;
  name?: string;
  onConfirm?: (newPool: { name: string, rightIds: string[] }) => void;
}

@Component({
  selector: 'waterfall-pool-modal',
  templateUrl: './pool-modal.component.html',
  styleUrls: ['./pool-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WaterfallPoolModalComponent {

  poolRightsControl = new FormControl<string[]>([]);
  poolNameControl = new FormControl('');
  public i18nStrings = {
    update: $localize`Update`,
    create: $localize`Create`,
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PoolModalData,
    private dialogRef: MatDialogRef<WaterfallPoolModalComponent>,
  ) {
    this.poolRightsControl.setValue([...this.data.selected]);
    if (this.data.name) this.poolNameControl.setValue(this.data.name);
  }

  create() {
    this.data.onConfirm({
      name: this.poolNameControl.value,
      rightIds: this.poolRightsControl.value,
    });
    this.dialogRef.close(true);
  }

  close() {
    this.dialogRef.close(false);
  }
}
