import { Component, Inject, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HostedMediaForm } from '@blockframes/media/form/media.form';
import { MediaRatioType } from '../../../components/cropper/cropper.component';
import { isHostedMediaForm } from '../explorer.model';

@Component({
  selector: 'file-explorer-cropper-dialog',
  templateUrl: 'cropper-dialog.component.html',
  styleUrls: ['./cropper-dialog.component.scss']
})
export class FileExplorerCropperDialogComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<FileExplorerCropperDialogComponent>,
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
