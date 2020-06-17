// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';

// Blockframes
import { MediaService } from '@blockframes/utils/media/media.service';
import { MediaQuery } from '@blockframes/utils/media/media.query';
import { UploadState } from '@blockframes/utils/media/media.store';

// RxJs
import { Observable } from 'rxjs';

@Component({
  selector: 'bf-upload-widget',
  templateUrl: 'upload-widget.component.html',
  styleUrls: ['./upload-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadWidgetComponent {

  items$: Observable<UploadState[]> = this.mediaQuery.selectAll();

  constructor(private mediaService: MediaService, private mediaQuery: MediaQuery) { }

  delegateAction(fileName: string, action: 'pause' | 'resume' | 'cancel' | 'clear') {
    this.mediaService[action](fileName);
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

  close() {
    this.mediaService.detachWidget()
    this.mediaService.clear();
  }
}