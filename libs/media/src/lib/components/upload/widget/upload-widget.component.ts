// Angular
import { Component, ChangeDetectionStrategy, Inject, HostBinding, HostListener } from '@angular/core';
import { AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';

// Blockframes
import { BehaviorStore } from '@blockframes/utils/helpers';
import { slideUp } from '@blockframes/utils/animations/fade';
import { getDeepValue } from '@blockframes/utils/pipes/deep-key.pipe';

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
   * This function has similarities to function getDocAndPath in @blockframes/firebase-utils
   */
  async removeReference(task: AngularFireUploadTask) {

    const path = task.task.snapshot.ref.fullPath;
    const filePathElements = path.split('/');

    // remove tmp/
    filePathElements.shift();
    // remove "protected/"" or "public/"
    filePathElements.shift();

    const collection = filePathElements.shift();
    const docId = filePathElements.shift();
    
    if (!docId || !collection) {
      throw new Error('Invalid path pattern');
    }

    // remove the file name
    filePathElements.pop();

    const docSnapshot = await this.db.collection(collection).doc(docId).get().toPromise();
    const docData = docSnapshot.data();
    const fieldToUpdate = filePathElements.join('.');

    const currentMediaValue = getDeepValue(docData, fieldToUpdate);

    if (Array.isArray(currentMediaValue)) {
      const index = currentMediaValue.findIndex(ref => typeof ref === 'string' ? ref === path : ref.ref === path)
      currentMediaValue.splice(index, 1);
    } else if (!!currentMediaValue.ref) {
      currentMediaValue.ref = '';
    } else {
      const elements = fieldToUpdate.split('.');
      if (elements.length === 1) {
      // field with reference is directly on docData
        docData[fieldToUpdate] = '';
      } else {
        // getting the parent object of the field with reference
        // this is needed because currentMediaValue of type string is not connected to docData
        const field = elements.pop();
        const pathToParent = elements.join('.');
        const mediaParent = getDeepValue(docData, pathToParent);
        mediaParent[field] = '';
      }
    }

    return docSnapshot.ref.update(docData);
  }
}
