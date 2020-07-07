// Angular
import { Injectable } from "@angular/core";
import { AngularFireStorage } from "@angular/fire/storage";
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { AngularFirestore } from "@angular/fire/firestore";

// State
import { UploadFile, ImgRef, imgSizeDirectory, HostedMediaFormValue } from "./media.firestore";

// Blockframes
import { get } from 'lodash';
import { map, takeWhile } from "rxjs/operators";

// Blockframes
import { UploadWidgetComponent } from "../components/upload/widget/upload-widget.component";
import { TaskService } from "./tasks.service";

@Injectable({ providedIn: 'root' })
export class MediaService {

  private overlayOptions = {
    height: '400px',
    width: '500px',
    panelClass: 'upload-widget',
    positionStrategy: this.overlay.position().global().bottom('16px').left('16px')
  }

  public overlayRef: OverlayRef;

  constructor(
    private db: AngularFirestore,
    private tasks: TaskService,
    private storage: AngularFireStorage,
    private overlay: Overlay
  ) {

    this.tasks.endOfTasks$.subscribe(isEnd => {
      if (isEnd) {
        this.detachWidget();
        this.tasks.remove();
      }
    });

  }

  /** Check if a file exists in the **Firebase storage** */
  async exists(path: string, fileName: string): Promise<boolean> {

    return this.storage.ref(path).listAll().toPromise()
    .then((res) => res.items.some(item => item.name === fileName))
    .catch(() => false);
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

    const exists = await this.exists(path, fileName);

    this.showWidget();

    if (exists) {
      throw new Error(`Upload Error : there is already a file @ ${fileName}, please delete it before uploading a new file!`);
    }

    const uploading = this.tasks.isUploading(fileName);
    if (uploading) {
      throw new Error(`Upload Error : A file named ${fileName} is already uploading!`);
    }

    const task = this.storage.upload(path.concat(fileName), fileOrBlob);

    this.tasks.add({
      id: fileName,
      status: 'uploading',
      progress: 0,
      uploadtask: task
    });

    task.percentageChanges().subscribe(p => this.tasks.updateProgress(fileName, p));

    task.then(
      // on success
      () => {
        this.tasks.updateStatus(fileName, 'succeeded');
      },

      // on error (canceled is treated by firebase as an error)
      () => {
        this.tasks.updateStatus(fileName, 'canceled');
      }
    );
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

  public detachWidget() {
    this.overlayRef.detach()
    delete this.overlayRef;
  }

  private async showWidget() {
    if (!this.overlayRef) {
      this.overlayRef = this.overlay.create(this.overlayOptions);
      this.overlayRef.attach(new ComponentPortal(UploadWidgetComponent));
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
        await this.upload(mediaForm.ref, mediaForm.fileName, mediaForm.blobOrFile);
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
