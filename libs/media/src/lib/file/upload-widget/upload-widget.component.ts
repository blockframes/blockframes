// Angular
import { Component, ChangeDetectionStrategy, Inject, HostBinding, HostListener } from '@angular/core';
import { AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';

// Blockframes
import { BehaviorStore } from '@blockframes/utils/observable-helpers';
import { slideUp } from '@blockframes/utils/animations/fade';

@Component({
  selector: 'file-upload-widget',
  templateUrl: 'upload-widget.component.html',
  styleUrls: ['./upload-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [slideUp]
})
export class UploadWidgetComponent {
  @HostBinding('@slideUp') animation = true;

  @HostListener('window:beforeunload', [ '$event' ])
  beforeUnloadHandler(event: Event) {
    const uploading = this.tasks.value.some(task => {
      const state = task.task.snapshot.state as 'success' | 'paused' | 'running' | 'canceled';
      return state === 'running';
    });
    if (uploading) {
      // Prompts warning to ask if you want to leave the page
      event.returnValue = true;
    }
  }

  constructor(
    @Inject('tasks') public tasks: BehaviorStore<AngularFireUploadTask[]>,
    @Inject('db') public db: AngularFirestore
  ) {}

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
