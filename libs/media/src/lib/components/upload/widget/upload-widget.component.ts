// Angular
import { Component, ChangeDetectionStrategy, Inject, HostBinding, HostListener } from '@angular/core';
import { AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';

// Blockframes
import { BehaviorStore } from '@blockframes/utils/helpers';
import { slideUp } from '@blockframes/utils/animations/fade';
import { getDeepValue } from '@blockframes/utils/pipes/deep-key.pipe';
import { deconstructFilePath } from '@blockframes/utils/file-sanitizer';
import { HostedVideo, MovieNote } from '@blockframes/movie/+state/movie.firestore';
import { HostedMediaWithMetadata } from '@blockframes/media/+state/media.firestore';

@Component({
  selector: 'bf-upload-widget',
  templateUrl: 'upload-widget.component.html',
  styleUrls: ['./upload-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [slideUp]
})
export class UploadWidgetComponent {
  @HostBinding('@slideUp') animation = true;

  @HostListener('window:beforeunload', [ '$event' ])
  beforeUnloadHandler() {
    // check if there are tasks paused or errored; if so, then remove the reference
    for (const task of this.tasks.value) {
      const state = task.task.snapshot.state as 'success' | 'paused' | 'running' | 'canceled'
      if (state === 'paused' || state === 'canceled') {
        this.removeReference(task)
      }
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
    this.removeReference(tasks[index]);
    tasks.splice(index, 1);
    this.tasks.value = tasks;
  }

  /**
   * Removes the already-set References in the db 
   */
  async removeReference(task: AngularFireUploadTask) {

    const path = task.task.snapshot.ref.fullPath;
    const { docPath, field } = deconstructFilePath(path);

    const snapshot = await this.db.doc(docPath).get().toPromise();
    const data = snapshot.data();
    const media: string[] | HostedVideo[] | HostedMediaWithMetadata[] | MovieNote[] | string | HostedVideo = getDeepValue(data, field);

    if (Array.isArray(media)) {
      // Still Photos (string[]), Documents (HostedMediaWithMetadata[]), Notes & Statements (MovieNote) or OtherVideos (HostedVideo[])
      const index = media.findIndex(ref => typeof ref === 'string' ? ref === path : ref.ref === path);
      media.splice(index, 1);
      return snapshot.ref.update({ [field]: media });
    } else {
      // Logo, profile image, and more (string), Screener (HostedVideo)
      // Soon we will have files of type HostedMediaWithMetadata here too
      const refField = typeof media === 'string' ? field : `${field}.ref`;
      return snapshot.ref.update({ [refField]: '' });
    }
  }
}
