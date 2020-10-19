import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { Validators } from '@angular/forms';

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
  ) {
    data.note.get('ref').get('blobOrFile').setValidators(Validators.required);
    data.note.get('title').setValidators(Validators.required);
  }

  upload() {
    this.dialogRef.close(this.data.note)
  }

  cancel() {
    this.dialogRef.close()
  }

}