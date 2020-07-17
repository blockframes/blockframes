// Angular
import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { AngularFireUploadTask } from '@angular/fire/storage';

// RxJs
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'bf-upload-widget',
  templateUrl: 'upload-widget.component.html',
  styleUrls: ['./upload-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadWidgetComponent {

  tasklist$: Observable<AngularFireUploadTask[]>;

  constructor(
    @Inject('tasks') public tasks: BehaviorSubject<AngularFireUploadTask[]>,
  ) {
    this.tasklist$ = this.tasks.asObservable();
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

  cancel(task: AngularFireUploadTask) {
    task.resume();
    task.cancel();
  }

  remove(index: number) {
    const tasks = this.tasks.getValue();
    tasks.splice(index, 1);
    this.tasks.next(tasks);
  }

}