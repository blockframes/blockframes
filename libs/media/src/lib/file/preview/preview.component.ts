import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StorageFile } from '@blockframes/model';

@Component({
  selector: 'file-preview',
  templateUrl: 'preview.component.html',
  styleUrls: ['./preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FilePreviewComponent {

  constructor(
    private dialogRef: MatDialogRef<FilePreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { ref: StorageFile }
  ) { }

  close() {
    this.dialogRef.close();
  }
}
