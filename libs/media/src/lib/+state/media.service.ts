// Angular
import { Injectable, Injector } from "@angular/core";
import { AngularFireStorage, AngularFireUploadTask } from "@angular/fire/storage";
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { AngularFirestore } from "@angular/fire/firestore";

// State
import { UploadData, ImgRef, imgSizeDirectory, HostedMediaFormValue } from "./media.firestore";

// Blockframes
import { UploadWidgetComponent } from "../components/upload/widget/upload-widget.component";
import { delay, BehaviorStore } from "@blockframes/utils/helpers";

// Rxjs
import { map, takeWhile } from "rxjs/operators";

// Lodash
import { get } from 'lodash';

@Injectable({ providedIn: 'root' })
export class MediaService {

  private _tasks = new BehaviorStore<AngularFireUploadTask[]>([]);

  private overlayOptions = {
    height: '400px',
    width: '500px',
    panelClass: 'upload-widget',
    positionStrategy: this.overlay.position().global().bottom('16px').left('16px')
  }

  public overlayRef: OverlayRef;

  constructor(
    private db: AngularFirestore,
    private storage: AngularFireStorage,
    private overlay: Overlay
  ) {}

  /** Check if a file exists in the **Firebase storage** */
  async exists(path: string, fileName: string): Promise<boolean> {

    return this.storage.ref(path).listAll().toPromise()
    .then((res) => res.items.some(item => item.name === fileName))
    .catch(() => false);
  }

  async upload(uploadFiles: UploadData | UploadData[]) {
    const files = Array.isArray(uploadFiles) ? uploadFiles : [uploadFiles];
    const tasks = files.map(file => this.storage.upload(`${file.path}${file.fileName}`, file.data));
    this.addTasks(tasks);
    (Promise as any).allSettled(tasks)
      .then(() => delay(5000))
      .then(() => this.detachWidget());
    this.showWidget();
  }

  /**
   * Delete a file from teh firebase storage.
   * @note the function needs the **full** path of the file
   * **this include the file name!**
   * @note usually you can use `HostedMediaFormValue.oldRef` to feed the `path` param
   */
  async removeFile(path: string) {
    await this.storage.ref(path).delete().toPromise();

    // if we delete an image, we will wait until the deletion of all the sizes
    if (path.includes('original')) {
      await this.waitForImageDeletion(path);
    }
  }

  private addTasks(tasks: AngularFireUploadTask[]) {
    const t = this._tasks.value;
    t.push(...tasks);
    this._tasks.value = t
  }

  private detachWidget() {
    if (!this.overlayRef) return;

    const canClose = this._tasks.value.every(task => task.task.snapshot.state === 'success');
    if (canClose) {
      this.overlayRef.detach();
      delete this.overlayRef;
      const tasks = this._tasks.value.filter(task => task.task.snapshot.state !== 'success');
      this._tasks.value = tasks;
    }
  }

  private async showWidget() {
    if (!this.overlayRef) {
      this.overlayRef = this.overlay.create(this.overlayOptions);
      const instance = new ComponentPortal(UploadWidgetComponent);
      instance.injector = Injector.create({ providers: [{ provide: 'tasks', useValue: this._tasks }]});
      this.overlayRef.attach(instance);
    }
  }

  async uploadOrDeleteMedia(mediaForms: HostedMediaFormValue[]) {
    const promises = mediaForms.map(async mediaForm => {

      if (!!mediaForm.fileName) {
        // remove every characters after the 100th to avoid file too long error
        // this way we don't need to sanitize name anymore
        // (firebase also supports file names with unicode chars)
        mediaForm.fileName = mediaForm.fileName.substr(0, 100);
      }

      // if the file needs to be deleted and we know its path
      if (mediaForm.delete && !!mediaForm.oldRef) {

        await this.removeFile(mediaForm.oldRef);

      // if we have a blob = the user created or updated the file
      } else if (!!mediaForm.blobOrFile) {

        // if the file already have a path it means that we are in an update
        // we first need to delete the old file
        if (mediaForm.oldRef !== '') {
          try {
            await this.removeFile(mediaForm.oldRef);
          } catch (error) {
            console.warn('Deletion of previous file failed, but new file will still be uploaded');
          }
        }

        // upload the new file
        this.upload({
          data: mediaForm.blobOrFile,
          path: mediaForm.ref,
          fileName: mediaForm.fileName
        });

      }
    });
    await Promise.all(promises);
  }

  waitForImageDeletion(path: string) {

    // extract info from the path

    const pathParts = path.split('/');
    if (pathParts.length < 5) {
      throw new Error(`Invalid Path : ${path}, path must contain at least 5 parts : collection/id/one-or-more-field/original/fileName`)
    }
    const collection = pathParts.shift();
    const docId = pathParts.shift();
    pathParts.pop(); // remove filename
    pathParts.pop(); // remove 'original'

    const fieldToUpdate = pathParts.join('.');

    // listen on the corresponding firestore doc
    const doc = this.db.collection(collection).doc(docId);

    const allSizeEmpty = (image: ImgRef) => imgSizeDirectory.every(key => !image[key].ref);

    // listen on every changes of the current document
    return doc.snapshotChanges().pipe(
      map(action => get(action.payload.data(), fieldToUpdate)),
      takeWhile((image: ImgRef) => !allSizeEmpty(image)),
    ).toPromise();
  }

}
