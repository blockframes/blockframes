
import { Injectable, Injector } from '@angular/core';
import { ComponentPortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { UploadTask } from 'firebase/storage';
import { AuthService } from '@blockframes/auth/service';
import { tempUploadDir } from '@blockframes/utils/file-sanitizer';
import { BehaviorStore } from '@blockframes/utils/observable-helpers';
import { delay } from '@blockframes/utils/helpers';
import { UploadData, isValidMetadata } from '@blockframes/model';
import { UploadWidgetComponent } from './file/upload-widget/upload-widget.component';
import { getTaskStateObservable } from './file/upload-widget/task.pipe';
import { FireStorage, FirestoreService, percentage } from 'ngfire';
import { BehaviorSubject, Subscription } from 'rxjs';
import { SentryService } from '@blockframes/utils/sentry.service';

@Injectable({ providedIn: 'root' })
export class FileUploaderService {

  private tasks = new BehaviorStore<UploadTask[]>([]);
  private tasksState = new BehaviorStore<unknown[]>([]);
  public finalizedUpload = new BehaviorSubject<boolean>(false);
  private finalizedSubs: Subscription[] = [];
  private finalizedUploadDelay = 5000;

  private queue: Record<string, UploadData[] | null> = {};

  public overlayRef: OverlayRef;
  private overlayOptions = {
    width: '500px',
    panelClass: 'upload-widget',
    positionStrategy: this.overlay.position().global().bottom('16px').left('16px')
  }

  constructor(
    private overlay: Overlay,
    private authService: AuthService,
    private firestore: FirestoreService,
    private storage: FireStorage,
    private sentryService: SentryService,
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
    if (this.queue[storagePath].some(upload => upload.fileName === fileName)) throw new Error(`This file has already been selected. Please choose a different file.`);

    this.queue[storagePath].push({ file, fileName, metadata });
  }

  /**
   * Remove a file (not yet uploaded) from the queue
   * @note if the file does not exists in the queue,
   * this function will not throw any error and simply do nothing
   */
  removeFromQueue(storagePath: string, fileNameOrIndex: string | number) {
    const uploads = this.queue[storagePath];

    if (!uploads || !uploads.length) return;

    const index = typeof fileNameOrIndex === 'number'
      ? fileNameOrIndex
      : uploads.findIndex(upload => upload?.fileName === fileNameOrIndex);

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
        const isValid = isValidMetadata(upload?.metadata, { uidRequired: false });
        if (!isValid) {
          const message = `Skipped upload because of invalid metadata.`;
          console.warn(message);
          console.warn(storagePath, upload?.metadata);
          this.sentryService.triggerError({ message, location: 'file-uploader-service', bugType: 'invalid-metadata' });
        }
        return isValid;
      });
      return !!arr.length;
    });

    const tasks = validQueue.map(([storagePath, uploads]) => {
      return uploads.map(upload => {
        upload.metadata.uid = this.authService.uid;

        // upload
        const finalPath = `${tempUploadDir}/${storagePath}/${upload.fileName}`;

        // avoid double uploading
        const alreadyUploading = (fullPath: string) => this.tasks.value.some(task => task.snapshot.ref.fullPath === fullPath);
        if (alreadyUploading(finalPath)) return undefined;

        const afTask = this.storage.upload(finalPath, upload.file, { customMetadata: upload.metadata });

        // clean on success
        if (afTask) {
          afTask.then(() => {
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
    this.listenOnFinalized();
  }

  /**
   * Set finalizedUpload to false after a delay to let some time to backend functions 
   * to update db document.
   * finalizedUpload is used in movie-tunnel components to prevent saving during this time.
   */
  private listenOnFinalized() {
    const locks = [];
    this.finalizedSubs = this.tasks.value.map(t => percentage(t).subscribe(p => {
      if (p.progress === 100) {
        this.finalizedUpload.next(true);
        locks.push(1);
        delay(this.finalizedUploadDelay).then(() => {
          if (locks.length === 1) this.finalizedUpload.next(false);
          locks.pop();
        });
      }
    }));
  }

  // --------------------------
  //          WIDGET         //
  // --------------------------

  private async detachWidget() {
    if (!this.overlayRef) return;

    const states = await Promise.all(this.tasksState.value);
    const canClose = states.every(state => state === 'success');
    if (canClose) {
      this.overlayRef?.detach();
      delete this.overlayRef;
      this.tasks.value = [];
      this.tasksState.value = [];

      // Unsubscribe from subscriptions that listen for ended uploads
      delay(this.finalizedUploadDelay).then(() => this.finalizedSubs.map(s => s?.unsubscribe()));
    }
  }

  private async showWidget() {
    if (!this.overlayRef) {
      this.overlayRef = this.overlay.create(this.overlayOptions);
      const instance = new ComponentPortal(UploadWidgetComponent);
      instance.injector = Injector.create({ providers: [{ provide: 'tasks', useValue: this.tasks }, { provide: 'db', useValue: this.firestore.db }] });
      this.overlayRef.attach(instance);
    }
  }

}
