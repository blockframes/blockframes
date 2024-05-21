import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { StorageFile } from '@blockframes/model';

@Component({
  selector: 'preview-file-modal',
  templateUrl: './preview-file-modal.component.html',
  styleUrls: ['./preview-file-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviewFileModalComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public ref: StorageFile & { showControls?: boolean },
    private dialogRef: MatDialogRef<PreviewFileModalComponent>
  ) { }
}
