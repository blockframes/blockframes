import { Component, Inject, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HostedMediaForm } from '@blockframes/media/form/media.form';
import { MediaRatioType } from '../../cropper/cropper.component';
import { isHostedMediaForm } from '../../../file/explorer/explorer.model';

@Component({
  selector: 'image-dialog',
  templateUrl: 'image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageDialogComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<ImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { form: HostedMediaForm, ratio: MediaRatioType, storagePath: string }
  ) { }

  ngOnInit() {
    if (isHostedMediaForm(this.data.form)) {
      this.data.form.get('cropped').setValidators(Validators.requiredTrue);
    }
  }

  upload() {
    this.dialogRef.close(this.data.form);
  }

  cancel() {
    this.dialogRef.close();
  }
}
