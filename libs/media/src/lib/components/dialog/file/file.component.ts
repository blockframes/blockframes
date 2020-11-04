import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { Privacy } from '@blockframes/utils/file-sanitizer';
import { MovieNotesForm } from '@blockframes/movie/form/movie.form';

// Material
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HostedMediaWithMetadataForm } from '@blockframes/media/form/media-with-metadata.form';

@Component({
  selector: 'file-dialog',
  templateUrl: 'file.component.html',
  styleUrls: ['./file.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FileDialogComponent implements OnInit {

  hostedMediaWithMetadataForm: HostedMediaWithMetadataForm;

  movieNotesForm: MovieNotesForm;
  roles = ['producer', 'director', 'other'];

  constructor(
    private dialogRef: MatDialogRef<FileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { form: HostedMediaWithMetadataForm | MovieNotesForm, privacy: Privacy, storagePath: string }
  ) {}

  ngOnInit() {

    if (isHostedMediaWithMetadataForm(this.data.form)) {
      this.hostedMediaWithMetadataForm = this.data.form;
      this.hostedMediaWithMetadataForm.get('ref').get('ref').setValidators(Validators.required);
      this.hostedMediaWithMetadataForm.get('title').setValidators(Validators.required);
    } else {
      this.movieNotesForm = this.data.form;
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
  return !!(form as HostedMediaWithMetadataForm).get('title')
}