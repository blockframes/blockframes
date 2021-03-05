import { ChangeDetectionStrategy, Component, Input, ViewChild, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { StorageFile } from '@blockframes/media/+state/media.firestore';

@Component({
  selector: '[ref] bf-preview-modal',
  templateUrl: 'preview.component.html',
  styleUrls: ['./preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviewModalComponent {

  @Input() ref: StorageFile;
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

  constructor(
    private dialog: MatDialog,
  ) { }

  async openModal() {
    this.dialog.open(this.dialogTemplate, {
      height: '60vh',
      hasBackdrop: true,
      data: this.ref,
    });
  }
}
