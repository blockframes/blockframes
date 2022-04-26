import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'preview-file-modal',
  templateUrl: './preview-file-modal.component.html',
  styleUrls: ['./preview-file-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviewFileModalComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public ref: any,
    private dialogRef: MatDialogRef<PreviewFileModalComponent>
  ) { }

}
