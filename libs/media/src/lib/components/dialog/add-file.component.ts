import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';

// Material
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { HostedMediaWithMetadataForm } from '@blockframes/media/form/media-with-metadata.form';
import { Privacy } from '@blockframes/utils/file-sanitizer';

@Component({
  selector: 'add-file-dialog',
  templateUrl: 'add-file.component.html',
  styleUrls: ['./add-file.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AddFileDialogComponent {

  constructor(
    private dialogRef: MatDialogRef<AddFileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { note: HostedMediaWithMetadataForm, privacy: Privacy, storagePath: string }
  ) {}

  upload() {
    this.dialogRef.close(this.data.note)
  }

  cancel() {
    this.dialogRef.close()
  }

}