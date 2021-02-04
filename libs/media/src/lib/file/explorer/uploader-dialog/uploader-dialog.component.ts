import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { Privacy } from '@blockframes/utils/file-sanitizer';
import { MovieNotesForm } from '@blockframes/movie/form/movie.form';

// Material
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HostedMediaWithMetadataForm } from '@blockframes/media/form/media-with-metadata.form';
import { AllowedFileType } from '@blockframes/utils/utils';

@Component({
  selector: 'file-explorer-uploader-dialog',
  templateUrl: 'uploader-dialog.component.html',
  styleUrls: ['./uploader-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FileExplorerUploaderDialogComponent implements OnInit {

  hostedMediaWithMetadataForm: HostedMediaWithMetadataForm;
  movieNotesForm: MovieNotesForm;

  roles = ['producer', 'director', 'other'];

  constructor(
    private dialogRef: MatDialogRef<FileExplorerUploaderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { form: HostedMediaWithMetadataForm | MovieNotesForm, privacy: Privacy, storagePath: string, acceptedFileType: AllowedFileType}
  ) {}

  ngOnInit() {

    if (isHostedMediaWithMetadataForm(this.data.form)) {
      this.hostedMediaWithMetadataForm = this.data.form;
      this.hostedMediaWithMetadataForm.get('ref').get('ref').setValidators(Validators.required);
      this.hostedMediaWithMetadataForm.get('title').setValidators(Validators.required);
    } else {
      this.movieNotesForm = this.data.form;
      this.movieNotesForm.get('ref').get('ref').setValidators(Validators.required);
    }
  }

  upload() {
    this.dialogRef.close(this.data.form);
  }

  cancel() {
    this.dialogRef.close();
  }

}

function isHostedMediaWithMetadataForm(form: MovieNotesForm | HostedMediaWithMetadataForm): form is HostedMediaWithMetadataForm {
  return !!(form as HostedMediaWithMetadataForm).get('title');
}
