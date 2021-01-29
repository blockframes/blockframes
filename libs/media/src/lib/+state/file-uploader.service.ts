
import { Injectable, Injector } from "@angular/core";
import { ComponentPortal } from "@angular/cdk/portal";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireStorage, AngularFireUploadTask } from "@angular/fire/storage";

import { AuthQuery } from "@blockframes/auth/+state";
import { tempUploadDir } from "@blockframes/utils/file-sanitizer";
import { BehaviorStore, delay } from "@blockframes/utils/helpers";

import { FileMetaData, isValidMetadata } from "./media.firestore";
import { UploadWidgetComponent } from "../file/upload-widget/upload-widget.component";

@Injectable({ providedIn: 'root' })
export class FileUploaderService {

  private tasks = new BehaviorStore<AngularFireUploadTask[]>([]);

  private queue: Record<string, { file: Blob | File, metadata: FileMetaData } | null> = {};


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
   * this path will be automatically prefixed with `tmp/`
   * @param file the actual raw data of the file to upload
   * @param metadata required metadata to complete the upload flow,
   * such as privacy, where is the corresponding db document, etc...
   */
  addToQueue(storagePath: string, file: Blob | File, metadata: FileMetaData) {

    console.log('ADD TO QUEUE', storagePath, file, metadata); // TODO REMOVE DEBUG LOG

    // Throw in case of duplicated path, instead of silently overwriting the first occurrence
    if (!!this.queue[storagePath]) throw new Error(`This storage path already exists in the queue : ${storagePath}`);

    this.queue[storagePath] = { file, metadata };
  }

  /**
   * Remove a file (not yet uploaded) from the queue
   * @param storagePath
   */
  removeFromQueue(storagePath: string) {
    delete this.queue[storagePath];
  }

  /** Remove every files (not yet uploaded) from the queue */
  clearQueue() {
    this.queue = {};
  }

  isInQueue(storagePath: string) {
    return !!this.queue[storagePath];
  }

  /** Upload all files in the queue */
  upload() {

    const validQueue = Object.entries(this.queue).filter(([storagePath, upload]) => {
      const isValid = isValidMetadata(upload.metadata, { uidRequired: false });
      if (!isValid) {
        console.warn('INVALID METADATA: upload will be skipped!');
        console.warn(storagePath, upload.metadata);
      }
      return isValid
    });

    const tasks = validQueue.map(([storagePath, upload]) => {

      upload.metadata.uid = this.userQuery.userId;

      // upload
      const afTask = this.storage.upload(`${tempUploadDir}/${storagePath}`, upload.file, { customMetadata: upload.metadata });

      // clean on success
      afTask.task.then(() => {
        console.log('task success, cleaning', storagePath); // TODO REMOVE DEBUG LOG
        this.queue[storagePath] = null;
      });

      return afTask;
    });

    this.tasks.value = [...this.tasks.value, ...tasks];
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
