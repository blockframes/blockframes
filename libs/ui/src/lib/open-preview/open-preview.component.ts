import { ChangeDetectionStrategy, Component, Input, ViewChild, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { StorageFile } from '@blockframes/model';
import { PreviewFileModalComponent } from '../preview-file-modal/preview-file-modal.component';

@Component({
  selector: '[ref] bf-preview-modal',
  templateUrl: 'open-preview.component.html',
  styleUrls: ['./open-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OpenPreviewModalComponent {

  @Input() ref: StorageFile;
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<unknown>;

  private dialogRef: MatDialogRef<unknown>;

  constructor(
    private dialog: MatDialog,
  ) { }

  async openModal() {
    this.dialogRef = this.dialog.open(PreviewFileModalComponent, {
      hasBackdrop: true,
      data: this.ref,
      autoFocus: false,
    });
  }

  public closeModal(): void {
    this.dialogRef.close(false);
  }
}
