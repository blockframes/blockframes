// Angular
import { Injectable, Injector } from "@angular/core";
import { AngularFireStorage, AngularFireUploadTask } from "@angular/fire/storage";
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
import { delay } from "@blockframes/utils/helpers";
import { UploadTaskSnapshot } from "@angular/fire/storage/interfaces";

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
    private storage: AngularFireStorage,
    private overlay: Overlay
  ) {}

  /** Check if a file exists in the **Firebase storage** */
  async exists(path: string, fileName: string): Promise<boolean> {

    return this.storage.ref(path).listAll().toPromise()
    .then((res) => res.items.some(item => item.name === fileName))
    .catch(() => false);
  }

  async uploadBlob(uploadFiles: UploadFile | UploadFile[]) {

    const files = Array.isArray(uploadFiles) ? uploadFiles : [uploadFiles]
    const tasks = files.map(file => this.storage.upload(file.path, file.data));
    Promise.allSettled(tasks as AngularFireUploadTask[]).then(() => delay(5000).then(() => this.detachWidget));
    this.showWidget(tasks);

  }

  /**
   * @description This function handles the upload process for one or many files. Make sure that
   * the oath param doesn't include the filename.
   * @param path should only have the path and not the file name in it
   * @param file
   */
  uploadFile(path: string, file: File | FileList) {
    const tasks = [];
    if (file instanceof File) {
      tasks.push(this.storage.upload(path.concat(file.name), file));
    } else {
      for (let index = 0; index < file.length; index++) {
        tasks.push(this.storage.upload(path.concat(file.item(index).name), file.item(index)));
      }
    }
    Promise.allSettled(tasks as Promise<UploadTaskSnapshot>[]).then(() => delay(5000).then(() => this.detachWidget));
    this.showWidget(tasks);
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
    this.overlayRef.detach();
    delete this.overlayRef;
  }

  private async showWidget(tasks?: AngularFireUploadTask[]) {
    if (!this.overlayRef) {
      this.overlayRef = this.overlay.create(this.overlayOptions);
      const instance = new ComponentPortal(UploadWidgetComponent);
      instance.injector = Injector.create({ providers: [{ provide: 'tasks', useValue: tasks }]});
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
        if (mediaForm.blobOrFile instanceof File) {
          await this.uploadFile(mediaForm.ref, mediaForm.blobOrFile);
        } else {
          await this.uploadBlob({
            data: mediaForm.blobOrFile,
            path: mediaForm.ref,
            fileName: mediaForm.fileName
          });
        }
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
