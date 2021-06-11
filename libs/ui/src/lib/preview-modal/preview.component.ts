import { ChangeDetectionStrategy, Component, Input, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { StorageFile } from '@blockframes/media/+state/media.firestore';

@Component({
  selector: '[ref] bf-preview-modal',
  templateUrl: 'preview.component.html',
  styleUrls: ['./preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviewModalComponent {

  @Input() ref: StorageFile;
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<unknown>;

  private dialogRef: MatDialogRef<unknown>;

  constructor(
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) { }

  async openModal() {
    this.dialogRef = this.dialog.open(this.dialogTemplate, {
      height: '60vh',
      hasBackdrop: true,
      data: this.ref,
      autoFocus: false,
    });
    this.cdr.markForCheck();
  }

  public closeModal(): void {
    this.dialogRef.close(false);
    this.cdr.detectChanges();
  }
}
