import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { Validators } from '@angular/forms';

// Material
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HostedMediaWithMetadataForm } from '@blockframes/media/form/media-with-metadata.form';
import { Privacy } from '@blockframes/utils/file-sanitizer';

@Component({
  selector: 'file-dialog',
  templateUrl: 'file.component.html',
  styleUrls: ['./file.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FileDialogComponent {

  constructor(
    private dialogRef: MatDialogRef<FileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { form: HostedMediaWithMetadataForm, privacy: Privacy, storagePath: string }
  ) {
    data.form.get('ref').get('ref').setValidators(Validators.required);
    data.form.get('title').setValidators(Validators.required);
  }

  upload() {
    this.dialogRef.close(this.data.form);
  }

  cancel() {
    this.dialogRef.close();
  }

}