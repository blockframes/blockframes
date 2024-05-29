import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { StorageFile } from '@blockframes/model';

@Component({
  selector: 'file-preview',
  templateUrl: 'preview-list.component.html',
  styleUrls: ['./preview-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FileListPreviewComponent {

  index: number;

  constructor(
    private dialogRef: MatDialogRef<FileListPreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { refs: StorageFile[], index: number }
  ) {
    this.index = data.index;
  }

  next() {
    this.index++;
  }

  previous() {
    this.index--;
  }

  close() {
    this.dialogRef.close();
  }
}
