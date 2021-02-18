
import { Injectable, Injector } from "@angular/core";
import { ComponentPortal } from "@angular/cdk/portal";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireStorage, AngularFireUploadTask } from "@angular/fire/storage";

import { AuthQuery } from "@blockframes/auth/+state";
import { tempUploadDir } from "@blockframes/utils/file-sanitizer";
import { BehaviorStore } from "@blockframes/utils/behavior-store";
import { delay } from '@blockframes/utils/helpers';

import { UploadData, FileMetaData, isValidMetadata } from "./media.model";
import { UploadWidgetComponent } from "../file/upload-widget/upload-widget.component";


@Injectable({ providedIn: 'root' })
export class FileUploaderService {

  private tasks = new BehaviorStore<AngularFireUploadTask[]>([]);

  private queue: Record<string, UploadData[] | null> = {};


  public overlayRef: OverlayRef;
  private overlayOptions = {
    width: '500px',
    panelClass: 'upload-widget',
    positionStrategy: this.overlay.position().global().bottom('16px').left('16px')
  }

  constructor(
    private overlay: Overlay,
    private db: AngularFirestore,
    private userQuery: AuthQuery,
    private storage: AngularFireStorage,
  ) { }

  /**
   * Add a file in the queue, ready to be uploaded
   * @param storagePath the storage path where the file will be uploaded,
   * - the *storage* path, **not** the db path!
   * - it **should not** start with `tmp/`
   * - it **should not** start with a `/`
   * - it **should not** end with a `/`
   * @param fileName the file name, this will be concatenated with the `storagePath`
   * @param file the actual raw data of the file to upload
   * @param metadata required metadata to complete the upload flow,
   * such as privacy, where is the corresponding db document, etc...
   */
  addToQueue(storagePath: string, uploadData: UploadData) {

    const { fileName, file, metadata } = uploadData;

    console.log('ADD TO QUEUE', storagePath, fileName, file, metadata); // TODO REMOVE DEBUG LOG

    // instantiate array if it doesn't exists yet
    if (!this.queue[storagePath]) this.queue[storagePath] = [];

    const uploads = this.queue[storagePath];

    // Throw in case of duplicated path, instead of silently overwriting the first occurrence
    if (uploads.some(upload => upload.fileName === fileName)) throw new Error(`This file already exists in the queue : ${storagePath} -> ${fileName}`);

    uploads.push({ file, fileName, metadata });
  }

  /**
   * Remove a file (not yet uploaded) from the queue
   * @note if the file does not exists in the queue,
   * this function will not throw any error and simply do nothing
   */
  removeFromQueue(storagePath: string, fileName: string) {

    const uploads = this.queue[storagePath];

    if (!uploads) return;

    const index = uploads.findIndex(upload => upload.fileName === fileName);

    // ! Do not remove/splice otherwise it will shift remaining uploads and can cause weird side effects
    if (index !== -1) uploads[index] = null;

    if (uploads.length === 0 || uploads.every(upload => !upload)) {
      // delete directly on `this.queue` instead of `uploads` otherwise it will do nothing
      delete this.queue[storagePath];
    }
  }

  /** Remove every files (not yet uploaded) from the queue */
  clearQueue() {
    this.queue = {};
  }

  retrieveFromQueue(storagePath: string, index = 0) {
    return this.queue[storagePath]?.[index];
  }

  /** Upload all files in the queue */
  upload() {

    const validQueue = Object.entries(this.queue).filter(([storagePath, uploads]) => {
      return uploads.filter(upload => {
        const isValid = isValidMetadata(upload.metadata, { uidRequired: false });
        if (!isValid) {
          console.warn('INVALID METADATA: upload will be skipped!');
          console.warn(storagePath, upload.metadata);
        }
        return isValid
      });
    });

    const tasks = validQueue.map(([storagePath, uploads]) => {
      return uploads.map(upload => {
        upload.metadata.uid = this.userQuery.userId;

        // upload
        const afTask = this.storage.upload(`${tempUploadDir}/${storagePath}/${upload.fileName}`, upload.file, { customMetadata: upload.metadata });

        // clean on success
        afTask.task.then(() => {
          console.log('task success, cleaning', storagePath); // TODO REMOVE DEBUG LOG
          this.removeFromQueue(storagePath, upload.fileName);
        });

        return afTask;
      });
    });

    // convert a [][] into a []
    // pre-ES2019 Array flattening, with ES2019 we could use Array.prototype.flat()
    const flattenedTasks = ([] as AngularFireUploadTask[]).concat(...tasks);

    // this.tasks.value = [...this.tasks.value, ...flattenedTasks];
    this.tasks.value = [...this.tasks.value, ...tasks.flat()];
    (Promise as any).allSettled(tasks)
      .then(() => delay(3000))
      .then(() => this.detachWidget());
    this.showWidget();
  }


  // --------------------------
  //          WIDGET         //
  // --------------------------

  private detachWidget() {
    if (!this.overlayRef) return;

    const canClose = this.tasks.value.every(task => task.task.snapshot.state === 'success');
    if (canClose) {
      this.overlayRef.detach();
      delete this.overlayRef;
      const tasks = this.tasks.value.filter(task => task.task.snapshot.state !== 'success');
      this.tasks.value = tasks;
    }
  }

  private async showWidget() {
    if (!this.overlayRef) {
      this.overlayRef = this.overlay.create(this.overlayOptions);
      const instance = new ComponentPortal(UploadWidgetComponent);
      instance.injector = Injector.create({ providers: [{ provide: 'tasks', useValue: this.tasks }, { provide: 'db', useValue: this.db }] });
      this.overlayRef.attach(instance);
    }
  }

}
