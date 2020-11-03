import { ChangeDetectionStrategy, Component, Input, ViewChild, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { HostedMediaForm } from '@blockframes/media/form/media.form';

@Component({
  selector: '[form] bf-preview-modal',
  templateUrl: 'preview.component.html',
  styleUrls: ['./preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviewModalComponent {

  @Input() link: string;
  @Input() form: HostedMediaForm
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>

  constructor(private dialog: MatDialog, private sanitizer: DomSanitizer) { }

  async openModal() {
    let ref: string | SafeUrl;
    if (!!this.form.blobOrFile.value) {
      const blobUrl = URL.createObjectURL(this.form.blobOrFile.value);
      ref = this.sanitizer.bypassSecurityTrustUrl(blobUrl);
    } else {
      ref = this.form.ref.value;
    }

    this.dialog.open(this.dialogTemplate, {
      height: '60vh',
      hasBackdrop: true,
      data: ref
    })
  }
}
