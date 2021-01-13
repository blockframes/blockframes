import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: '[ref] file-preview-dialog',
  templateUrl: 'preview-dialog.component.html',
  styleUrls: ['./preview-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FilePreviewDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<FilePreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { ref: string}
  ) { }

  close() {
    this.dialogRef.close();
  }
}
