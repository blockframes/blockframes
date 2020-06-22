// Angular
import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';

// Blockframes
import { MediaQuery } from '@blockframes/media/+state/media.query';
import { UploadState, MediaStore, isDone } from '@blockframes/media/+state/media.store';
import { REFERENCES } from '@blockframes/media/+state/media.tasks';

// RxJs
import { Observable } from 'rxjs';

@Component({
  selector: 'bf-upload-widget',
  templateUrl: 'upload-widget.component.html',
  styleUrls: ['./upload-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadWidgetComponent {

  items$: Observable<UploadState[]> = this.query.selectAll();

  constructor(
    @Inject(REFERENCES) private ref,
    private query: MediaQuery,
    private store: MediaStore
  ) { }

  pause(fileName: string) {
    if (fileName in this.ref.tasks && this.query.hasEntity(fileName)) {
      this.ref.tasks[fileName].pause();
      this.store.update(fileName, { status: 'paused' });
    }
  }

  resume(fileName: string) {
    if (fileName in this.ref.tasks && this.query.hasEntity(fileName)) {
      this.ref.tasks[fileName].resume();
      this.store.update(fileName, { status: 'uploading' });
    }
  }

  cancel(fileName: string) {
    if (fileName in this.ref.tasks && this.query.hasEntity(fileName)) {
      this.ref.tasks[fileName].cancel();
      this.store.update(fileName, { status: 'canceled' });
    }
  }
  
  /** Remove a single file from the store or remove all if no param is given*/
  clear(fileName?: string) {
    if (fileName) {
      this.store.remove(fileName)
    } else {
      this.store.remove(upload => isDone(upload));
    }
  }

  getFileType(file: string) {
    const type = file.split('.').pop();
    switch (type) {
      case 'docx' || 'doc':
        return '/assets/images/dark/docx.webp';
      case 'xls' || 'xlsx':
        return '/assets/images/dark/xls.webp';
      case 'png':
        return '/assets/images/dark/image.webp';
      case 'pdf':
        return '/assets/images/dark/pdf.webp';
      default:
        return '/assets/images/dark/image.webp';
    }
  }

}