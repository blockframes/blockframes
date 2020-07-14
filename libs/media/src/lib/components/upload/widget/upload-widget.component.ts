// Angular
import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';

// RxJs
import { AngularFireUploadTask } from '@angular/fire/storage';

@Component({
  selector: 'bf-upload-widget',
  templateUrl: 'upload-widget.component.html',
  styleUrls: ['./upload-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadWidgetComponent {

  constructor(
    @Inject('tasks') public tasklist: AngularFireUploadTask[],
  ) {}

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