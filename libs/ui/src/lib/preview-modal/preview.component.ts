import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { HostedMediaForm } from '@blockframes/media/form/media.form';
import { DialogPreviewComponent } from './dialog-preview/dialog-preview.component';

@Component({
  selector: '[form] bf-preview-modal',
  templateUrl: 'preview.component.html',
  styleUrls: ['./preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviewModalComponent {

  @Input() form: HostedMediaForm

  constructor(private dialog: MatDialog, private sanitizer: DomSanitizer) { }

  openModal() {
    let ref: any;
    if (!!this.form.blobOrFile.value) {
      const blobUrl = URL.createObjectURL(this.form.blobOrFile.value);
      ref = this.sanitizer.bypassSecurityTrustUrl(blobUrl);
    } else {
      ref = this.form.ref.value;
    }
    this.dialog.open(DialogPreviewComponent, {
      width: '50vw',
      hasBackdrop: true,
      data: { ref }
    })
  }
}