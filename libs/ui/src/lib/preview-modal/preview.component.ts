import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogPreviewComponent } from './dialog-preview/dialog-preview.component';

@Component({
  selector: '[ref] bf-preview-modal',
  templateUrl: 'preview.component.html',
  styleUrls: ['./preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviewModalComponent {

  @Input() ref: string

  constructor(private dialog: MatDialog) { 
    setTimeout(() => console.log(this.ref), 1000)
  }

  openModal() {
    this.dialog.open(DialogPreviewComponent, {
      width: '50vw',
      hasBackdrop: true,
      data: { ref: this.ref }
    })
  }
}