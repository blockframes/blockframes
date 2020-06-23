// Angular
import { Injectable } from "@angular/core";
import { AngularFireStorage, AngularFireUploadTask } from "@angular/fire/storage";
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

// State
import { MediaStore, isDone } from "./media.store";
import { MediaQuery } from "./media.query";
import { UploadFile, HostedMedia } from "./media.firestore";
import { HostedMediaForm } from "../directives/media/media.form";

// Blockframes
import { UploadWidgetComponent } from '../components/upload/widget/upload-widget.component';
import { sanitizeFileName } from '@blockframes/utils/file-sanitizer';

@Injectable({ providedIn: 'root' })
export class MediaService {

  private tasks: Record<string, AngularFireUploadTask> = {};

  private overlayOptions = {
    height: '400px',
    width: '500px',
    panelClass: 'upload-widget',
    positionStrategy: this.overlay.position().global().bottom('16px').left('16px')
  }

  public overlayRef: OverlayRef;

  constructor(
    private store: MediaStore,
    private query: MediaQuery,
    private storage: AngularFireStorage,
    private overlay: Overlay
  ) { }

  /** Check if a file exists in the **Firebase storage** */
  exists(path: string) {
    return this.storage.ref(path).getDownloadURL().toPromise().then(() => true).catch(() => false);
  }

  uploadBlob(uploadFiles: UploadFile | UploadFile[]) {

    if (Array.isArray(uploadFiles)) {
      uploadFiles.forEach(uploadFile => this.uploadBlob(uploadFile));
    } else {
      this.upload(uploadFiles.path, uploadFiles.data, uploadFiles.fileName);
    }
  }
  /**
   * @description This function handles the upload process for one or many files. Make sure that
   * the oath param doesn't include the filename.
   * @param path should only have the path and not the file name in it
   * @param file
   */
  uploadFile(path: string, file: File | FileList) {

    if (file instanceof File) {
      this.upload(path, file, file.name);
    } else {
      const promises = [];
      for (let index = 0; index < file.length; index++) {
        promises.push(this.upload(path, file.item(index), file.item(index).name));
      }
      Promise.all(promises);
    }
  }

  /**
 * @description This function handles the upload process for one or many files. Make sure that
 * the oath param doesn't include the filename.
 * @param path should only have the path and not the file name in it
 * @param fileOrBlob
 * @param fileName
 */
  private async upload(path: string, fileOrBlob: Blob | File, fileName: string) {
    const sanitizedFileName: string = sanitizeFileName(fileName);
    const exists = await this.exists(path.concat(sanitizedFileName));

    this.showWidget();

    if (exists) {
      throw new Error(`Upload Error : there is already a file @ ${sanitizedFileName}, please delete it before uploading a new file!`);
    }

    const uploading = this.query.isUploading(fileName);
    if (uploading) {
      throw new Error(`Upload Error : A file named ${fileName} is already uploading!`);
    }

    const task = this.storage.upload(path.concat(fileName), fileOrBlob);

    this.store.upsert(fileName, {
      status: 'uploading',
      progress: 0,
    });

    task.percentageChanges().subscribe(p => this.store.update(fileName, { progress: p }));

    this.tasks[fileName] = task;

    task.then(
      // on success
      () => {
        this.store.update(fileName, { status: 'succeeded' });
        delete this.tasks[fileName];
      },

      // on error (canceled is treated by firebase as an error)
      () => {
        this.store.update(fileName, { status: 'canceled' });
        delete this.tasks[fileName];
      }
    );
  }

  removeFile(path: string) {
    this.storage.ref(path).delete();
  }

  pause(fileName: string) {
    if (fileName in this.tasks && this.query.hasEntity(fileName)) {
      this.tasks[fileName].pause();
      this.store.update(fileName, { status: 'paused' });
    }
  }

  resume(fileName: string) {
    if (fileName in this.tasks && this.query.hasEntity(fileName)) {
      this.tasks[fileName].resume();
      this.store.update(fileName, { status: 'uploading' });
    }
  }

  cancel(fileName: string) {
    if (fileName in this.tasks && this.query.hasEntity(fileName)) {
      this.tasks[fileName].cancel();
      this.store.update(fileName, { status: 'canceled' });
    }
  }

  /** Remove a single file from the store or remove all if no param is given*/
  clear(fileName?: string) {
    if (fileName) {
      this.store.remove(fileName)
    } else {
      this.store.remove(upload => isDone(upload));
    }
  }

  public detachWidget() {
    this.overlayRef.detach()
    delete this.overlayRef;
  }

  private showWidget() {
    if (!this.overlayRef) {
      this.overlayRef = this.overlay.create(this.overlayOptions);
      this.overlayRef.attach(new ComponentPortal(UploadWidgetComponent));
    }
  }

  // TODO issue#3088
  // uploadOrDeleteMedia(mediaForms: HostedMediaForm[]) {
  //   mediaForms.forEach(mediaForm => {
  //     if (mediaForm.delete.value && !!mediaForm.ref.value) {
  //       this.removeFile(mediaForm.ref.value);
  //     } else if (!!mediaForm.blob.value) {
  //       if (mediaForm.ref.value !== '') {
  //         this.removeFile(mediaForm.ref.value);
  //       }
  //       const file: UploadFile = {
  //         path: mediaForm.ref.value,
  //         data: mediaForm.blob.value,
  //         fileName: mediaForm.fileName.value
  //       }
  //       this.uploadBlob(file);
  //     }
  //   })
  // }
}
