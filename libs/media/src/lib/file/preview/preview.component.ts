import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StorageFile } from '@blockframes/media/+state/media.firestore';

@Component({
  selector: 'file-preview',
  templateUrl: 'preview.component.html',
  styleUrls: ['./preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FilePreviewComponent {
  fullScreen = false;
  public keypressed;
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.keypressed = event.code;
    // console.log(this.keypressed);
  }
  @HostListener('fullscreenchange')
  trackFullScreenMode() {
    this.fullScreen = !this.fullScreen;
  }

  constructor(
    private dialogRef: MatDialogRef<FilePreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { ref: StorageFile },
    @Inject(DOCUMENT) private document: Document
  ) {
    if (this.document['webkitExitFullscreen'] || this.keypressed == 'Escape' ) {
      console.log('wtf22??');
      this.document['webkitExitFullscreen']();
      this.fullScreen = false;

      // this.document.getElementById('changeButtonState');
    }
   }

  close() {
    this.dialogRef.close();
  }
}
