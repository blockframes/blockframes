import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
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
