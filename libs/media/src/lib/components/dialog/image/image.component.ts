import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HostedMediaForm } from '@blockframes/media/form/media.form';
import { MediaRatioType } from '../../cropper/cropper.component';

@Component({
  selector: 'image-dialog',
  templateUrl: 'image.component.html'
})
export class ImageDialogComponent {

  constructor(
    private dialogRef: MatDialogRef<ImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { form: HostedMediaForm, ratio: MediaRatioType, storagePath: string }
  ) { }

  upload() {
    this.dialogRef.close(this.data.form);
  }

  cancel() {
    this.dialogRef.close();
  }
}