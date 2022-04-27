import { Component, ChangeDetectionStrategy, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StorageFile } from '@blockframes/model';

export interface GlobalModalStyle {
  style?: 'large' | 'medium' | 'small';
}

interface Data extends GlobalModalStyle {
  selectedFiles?: StorageFile[],
  onClose?: () => void
}

@Component({
  selector: 'global-modal',
  templateUrl: './global-modal.component.html',
  styleUrls: ['./global-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class GlobalModalComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: Data,
    public dialogRef: MatDialogRef<GlobalModalComponent>,
  ) { }

  public close(): void {
    if (this.data?.selectedFiles) return this.dialogRef.close(this.data.selectedFiles);
    if (this.data?.onClose) return this.data.onClose();
    return this.dialogRef.close(false);
  }

  public setModalType() {
    switch(this.data?.style) {
      case 'large':
        return 'sizeL';
      case 'medium':
        return 'sizeM';
      case 'small':
        return 'sizeS';
      default:
        return 'sizeM';
    }
  }
}