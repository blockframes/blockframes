import { ChangeDetectionStrategy, Component, Input, ViewChild, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
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
    this.dialog.open(this.dialogTemplate, {
      height: '60vh',
      hasBackdrop: true,
      data: this.form
    })
  }
}
