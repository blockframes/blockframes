// Angular
import { Component, ChangeDetectionStrategy, Inject, HostBinding } from '@angular/core';
import { AngularFireUploadTask } from '@angular/fire/storage';

// Blockframes
import { BehaviorStore } from '@blockframes/utils/helpers';
import { slideUp } from '@blockframes/utils/animations/fade';

@Component({
  selector: 'bf-upload-widget',
  templateUrl: 'upload-widget.component.html',
  styleUrls: ['./upload-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [slideUp]
})
export class UploadWidgetComponent {
  @HostBinding('@slideUp') animation = true;

  constructor(
    @Inject('tasks') public tasks: BehaviorStore<AngularFireUploadTask[]>,
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
