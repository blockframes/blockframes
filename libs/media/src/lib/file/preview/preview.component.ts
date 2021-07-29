import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StorageFile } from '@blockframes/media/+state/media.firestore';

@Component({
  selector: 'file-preview',
  templateUrl: 'preview.component.html',
  styleUrls: ['./preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FilePreviewComponent {

  ref: StorageFile;

  refs: StorageFile[];
  index: number = 0;

  constructor(
    private dialogRef: MatDialogRef<FilePreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { ref: StorageFile } | { refs: StorageFile[], index: number }
  ) {
    if ('ref' in data) {
      this.ref = data.ref
    } else {
      this.index = data.index;
      this.ref = data.refs[data.index];
      this.refs = data.refs;
    }
  }

  next() {
    if ('refs' in this.data) {
      this.index++
      this.ref = this.data.refs[this.index];
    }
  }

  previous() {
    if ('refs' in this.data) {
      this.index--
      this.ref = this.data.refs[this.index];
    }
  }

  close() {
    this.dialogRef.close();
  }
}
