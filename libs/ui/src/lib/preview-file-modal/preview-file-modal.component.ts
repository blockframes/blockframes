import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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
