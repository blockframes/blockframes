// Angular
import { Injectable } from "@angular/core";
import { AngularFireStorage, AngularFireUploadTask } from "@angular/fire/storage";
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

// State
import { MediaStore, isDone } from "./media.store";
import { MediaQuery } from "./media.query";
import { UploadFile, HostedMedia, ImgRef } from "./media.firestore";
import { HostedMediaForm } from "../directives/media/media.form";

// Blockframes
import { UploadWidgetComponent } from '../components/upload/widget/upload-widget.component';
import { sanitizeFileName } from '@blockframes/utils/file-sanitizer';
import { AngularFirestore } from "@angular/fire/firestore";
import { get } from 'lodash';
import { takeWhile } from "rxjs/operators";

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
    private db: AngularFirestore,
    private storage: AngularFireStorage,
    private overlay: Overlay
  ) { }

  /** Check if a file exists in the **Firebase storage** */
  exists(path: string) {
    return this.storage.ref(path).getDownloadURL().toPromise().then(() => true).catch(() => false);
  }

  /**
 * This function handles the upload process for one or many files.
 *
 * @note **Make sure that the path param does not include the filename.**
 * @note **Make sure that the path ends with a `/`.**
 *
 */
  uploadBlob(uploadFiles: UploadFile | UploadFile[]) {

    if (Array.isArray(uploadFiles)) {
      uploadFiles.forEach(uploadFile => this.uploadBlob(uploadFile));
    } else {
      this.upload(uploadFiles.path, uploadFiles.fileName, uploadFiles.data,);
    }
  }

 /**
 * This function handles the upload process for one or many files.
 *
 * @note **Make sure that the path param does not include the filename.**
 * @note **Make sure that the path ends with a `/`.**
 *
 */
  uploadFile(path: string, file: File | FileList) {

    if (file instanceof File) {
      this.upload(path, file.name, file);
    } else {
      const promises = [];
      for (let index = 0; index < file.length; index++) {
        promises.push(this.upload(path, file.item(index).name, file.item(index)));
      }
      Promise.all(promises);
    }
  }

  /**
 * This function handles the upload process for one or many files.
 *
 * @note **Make sure that the path param does not include the filename.**
 * @note **Make sure that the path ends with a `/`.**
 *
 */
  private async upload(path: string, fileName: string, fileOrBlob: Blob | File,) {

    // TODO create extensive regexp to try to catch and handle any mistakes in path & filename

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

  async removeFile(path: string) {
    await this.storage.ref(path).delete().toPromise();

    // if we delete an image, we will wait until the deletion of all the sizes
    if (path.includes('original')) {
      await this.waitForImageDeletion(path);
    }
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

  async uploadOrDeleteMedia(mediaForms: HostedMediaForm[]) {
    const promises = mediaForms.map(async mediaForm => {

      // if the file needs to be deleted and we know its path
      if (mediaForm.delete.value && !!mediaForm.ref.value) {

        console.log('will delete');
        await this.removeFile(mediaForm.ref.value);
        console.log('deleted');

      // if we have a blob = the user created or updated the file
      } else if (!!mediaForm.blobOrFile.value) {

        // if the file already have a path it means that we are in an update
        // we first need to delete the old file
        if (mediaForm.oldRef.value !== '') {
          console.log('will update');
          await this.removeFile(mediaForm.oldRef.value);
        } else {
          console.log('will create');
        }

        console.log('will upload');

        // upload the new file
        const file: UploadFile = {
          path: mediaForm.ref.value, // be careful, here we can easily have a wrong path
          data: mediaForm.blobOrFile.value,
          fileName: mediaForm.fileName.value
        }
        console.log(file);
        this.upload(mediaForm.ref.value, mediaForm.fileName.value, mediaForm.blobOrFile.value);
      } else {
        console.log('nothing needs to be done');
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

    // create a promise that resolve when all image sizes are empty
    return new Promise(res => {
      // listen on every changes of the current document
      const sub = doc.snapshotChanges().subscribe(action => {
        const docData = action.payload.data();
        const image: ImgRef = get(docData, fieldToUpdate);
        // check if all image size are empty
        if (
          !image.original.ref &&
          !image.fallback.ref &&
          !image.xs.ref &&
          !image.md.ref &&
          !image.lg.ref
        ) {
          sub.unsubscribe(); // cancel the observable
          res(); // resolve the promise
        }
      });
    });
  }

}
