// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';

// Blockframes
import { TaskService, UploadTask } from '@blockframes/media/+state/tasks.service';

// RxJs
import { Observable } from 'rxjs';

@Component({
  selector: 'bf-upload-widget',
  templateUrl: 'upload-widget.component.html',
  styleUrls: ['./upload-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadWidgetComponent {

  items$: Observable<UploadTask[]> = this.tasks.tasks$;

  constructor(
    private tasks: TaskService
  ) { }

  pause(fileName: string) {
    if (this.tasks.tasks[fileName]) {
      this.tasks.tasks[fileName].uploadtask.pause();
      this.tasks.updateStatus(fileName, 'paused');
    }
  }

  resume(fileName: string) {
    if (this.tasks.tasks[fileName]) {
      this.tasks.tasks[fileName].uploadtask.resume();
      this.tasks.updateStatus(fileName, 'uploading');
    } 
  }

  cancel(fileName: string) {
    if (this.tasks.tasks[fileName]) {
      this.tasks.tasks[fileName].uploadtask.cancel();
      this.tasks.updateStatus(fileName, 'canceled');
    }
  }
  
  /** Remove a single file from the store or remove all if no param is given*/
  clear(fileName?: string) {
    this.tasks.remove(fileName);
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