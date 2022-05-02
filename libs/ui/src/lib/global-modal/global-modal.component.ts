import { Component, ChangeDetectionStrategy, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StorageFile } from '@blockframes/model';

type Size = 'large' | 'medium' | 'small';

interface CommonModalData {
  size: Size;
  selectedFiles?: StorageFile[];
  onClose?: () => void;
}

export function createModalData<T>(data: T, size: Size = 'medium'): T & CommonModalData {
  return { ...data, size };
}

@Component({
  selector: 'global-modal',
  templateUrl: './global-modal.component.html',
  styleUrls: ['./global-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlobalModalComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CommonModalData,
    public dialogRef: MatDialogRef<GlobalModalComponent>,
  ) { }

  public close(): void {
    if (this.data?.selectedFiles) return this.dialogRef.close(this.data.selectedFiles);
    if (this.data?.onClose) return this.data.onClose();
    return this.dialogRef.close(false);
  }

}