// Angular
import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { AngularFireUploadTask } from '@angular/fire/storage';

// Blockframes
import { BehaviorStore } from '@blockframes/utils/helpers';

@Component({
  selector: 'bf-upload-widget',
  templateUrl: 'upload-widget.component.html',
  styleUrls: ['./upload-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadWidgetComponent {


  constructor(
    @Inject('tasks') public tasks: BehaviorStore<AngularFireUploadTask[]>,
  ) {}

  getFileType(file: string) {
    const type = file.split('.').pop();
    switch (type) {
      case 'docx':
      case 'doc':
        return '/assets/images/dark/docx.webp';
      case 'xls':
      case 'xlsx':
        return '/assets/images/dark/xls.webp';
      case 'png':
      case 'webp':
      case 'jpg':
        return '/assets/images/dark/image.webp';
      case 'pdf':
        return '/assets/images/dark/pdf.webp';
      default:
        return '/assets/images/dark/image.webp';
    }
  }

  cancel(task: AngularFireUploadTask) {
    task.resume();
    task.cancel();
  }

  remove(index: number) {
    const tasks = this.tasks.value;
    tasks.splice(index, 1);
    this.tasks.value = tasks;
  }

}
