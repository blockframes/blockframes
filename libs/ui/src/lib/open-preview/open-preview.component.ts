import { ChangeDetectionStrategy, Component, Input, ViewChild, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { StorageFile } from '@blockframes/model';
import { createModalData } from '../global-modal/global-modal.component';
import { PreviewFileModalComponent } from '../preview-file-modal/preview-file-modal.component';
import { boolean } from '@blockframes/utils/decorators/decorators';

@Component({
  selector: '[ref] bf-preview-modal',
  templateUrl: 'open-preview.component.html',
  styleUrls: ['./open-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OpenPreviewComponent {

  @Input() ref: StorageFile;
  @Input() color = 'primary'
  @Input() @boolean showControls = false;
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<unknown>;

  private dialogRef: MatDialogRef<unknown>;

  constructor(
    private dialog: MatDialog,
  ) { }

  async openModal() {
    this.dialogRef = this.dialog.open(PreviewFileModalComponent, {
      data: createModalData({ ...this.ref, showControls: this.showControls }),
      hasBackdrop: true,
      autoFocus: false,
    });
  }

  public closeModal(): void {
    this.dialogRef.close(false);
  }
}
