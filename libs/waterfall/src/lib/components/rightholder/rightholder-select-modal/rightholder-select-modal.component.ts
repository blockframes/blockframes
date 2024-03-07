import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Waterfall, WaterfallRightholder } from '@blockframes/model';
import { FormControl } from '@angular/forms';

interface RightholderData {
  waterfall: Waterfall;
  rightHolderId: string;
  onConfirm: (rightholderId: string) => void
}

@Component({
  selector: '[rightholders]waterfall-rightholder-select-modal',
  templateUrl: './rightholder-select-modal.component.html',
  styleUrls: ['./rightholder-select-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RightholderSelectModalComponent {
  public rightholderId = new FormControl<string>('');
  public rightholder: WaterfallRightholder;
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: RightholderData,
    public dialogRef: MatDialogRef<RightholderSelectModalComponent>
  ) {
    this.rightholderId.setValue(data.rightHolderId);
    this.rightholder = data.waterfall.rightholders.find(r => r.id === data.rightHolderId);
  }

  public confirm() {
    this.data.onConfirm(this.rightholderId.value);
    this.dialogRef.close(true);
  }

  public close() {
    this.dialogRef.close(false);
  }
}
