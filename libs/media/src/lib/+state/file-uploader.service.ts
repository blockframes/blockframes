
import { Injectable, Injector } from "@angular/core";
import { ComponentPortal } from "@angular/cdk/portal";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireStorage, AngularFireUploadTask } from "@angular/fire/storage";

import { AuthService } from "@blockframes/auth/+state";
import { tempUploadDir } from "@blockframes/utils/file-sanitizer";
import { BehaviorStore } from "@blockframes/utils/observable-helpers";
import { delay } from '@blockframes/utils/helpers';

import { UploadData, isValidMetadata } from "./media.model";
import { UploadWidgetComponent } from "../file/upload-widget/upload-widget.component";
import { getTaskStateObservable } from "../file/upload-widget/task.pipe";

@Injectable({ providedIn: 'root' })
export class FileUploaderService {

  private tasks = new BehaviorStore<AngularFireUploadTask[]>([]);
  private tasksState = new BehaviorStore<unknown[]>([]);

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
    private authService: AuthService,
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

    // instantiate array if it doesn't exists yet
    if (!this.queue[storagePath]) this.queue[storagePath] = [];

    // Throw in case of duplicated path, instead of silently overwriting the first occurrence
    if (this.queue[storagePath].some(upload => upload.fileName === fileName)) throw new Error(`This file already exists in the queue : ${storagePath} -> ${fileName}`);

    this.queue[storagePath].push({ file, fileName, metadata });
  }

  /**
   * Remove a file (not yet uploaded) from the queue
   * @note if the file does not exists in the queue,
   * this function will not throw any error and simply do nothing
   */
  removeFromQueue(storagePath: string, fileName: string) {

    const uploads = this.queue[storagePath];

    if (!uploads || !uploads.length) return;

    const index = uploads.findIndex(upload => upload?.fileName === fileName);

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
      const arr = uploads.filter(upload => {
        const isValid = isValidMetadata(upload.metadata, { uidRequired: false });
        if (!isValid) {
          console.warn('INVALID METADATA: upload will be skipped!');
          console.warn(storagePath, upload.metadata);
        }
        return isValid
      })
      return !!arr.length
    });

    const tasks = validQueue.map(([storagePath, uploads]) => {
      return uploads.map(upload => {
        upload.metadata.uid = this.authService.profile.uid;

        // upload
        const finalPath = `${tempUploadDir}/${storagePath}/${upload.fileName}`;

        // avoid double uploading
        const alreadyUploading = (fullPath: string) => this.tasks.value.some(task => task.task.snapshot.ref.fullPath === fullPath);
        if (alreadyUploading(finalPath)) return undefined;

        const afTask = this.storage.upload(finalPath, upload.file, { customMetadata: upload.metadata });

        // clean on success
        if (afTask) {
          afTask.task.then(() => {
            this.removeFromQueue(storagePath, upload.fileName);
          });
        }

        return afTask;
      });
    });

    const tasksState = tasks.flat().filter(task => !!task).map(task => getTaskStateObservable(task).toPromise());
    this.tasks.value = [...this.tasks.value, ...tasks.flat().filter(task => !!task)];
    this.tasksState.value = [...this.tasksState.value, ...tasksState];
    Promise.allSettled(tasks)
      .then(() => delay(3000))
      .then(() => this.detachWidget());
    this.showWidget();
  }


  // --------------------------
  //          WIDGET         //
  // --------------------------

  private async detachWidget() {
    if (!this.overlayRef) return;

    const states = await Promise.all(this.tasksState.value)
    const canClose = states.every(state => state === 'success')
    if (canClose) {
      this.overlayRef.detach();
      delete this.overlayRef;
      this.tasks.value = [];
      this.tasksState.value = [];
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
