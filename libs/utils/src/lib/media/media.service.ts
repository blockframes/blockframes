// Angular
import { Injectable } from "@angular/core";
import { AngularFireStorage, AngularFireUploadTask } from "@angular/fire/storage";
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

// State
import { MediaStore, isDone } from "./media.store";
import { MediaQuery } from "./media.query";
import { UploadFile } from "./media.firestore";
import * as objectPath from 'object-path';
import { ImgRefForm } from "@blockframes/ui/media/image-reference/image-reference.form";

// Blockframes
import { UploadWidgetComponent } from '@blockframes/ui/upload/widget/upload-widget.component';

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
      this.upload(uploadFiles.ref, uploadFiles.data, uploadFiles.fileName);
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
        promises.push(this.upload(path, file.item(index), file.item(index).name))
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
    const exists = await this.exists(path.concat(fileName));
    this.showWidget();

    if (exists) {
      throw new Error(`Upload Error : there is already a file @ ${path}, please delete it before uploading a new file!`);
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
  
  public extractMediaForm(form, extractPaths: string[]) {
    
    const value = form.value;
    const extracted = {};

  }

  public handleMediaForms(form) {

    const medias = searchForMediaRef(form);

    medias.forEach(form => {
      if (form.delete.value) {
  
        // this.media.removeFile(media.ref.value);
        form.ref.setValue('');
  
      } else if (!!form.blob.value) {
  
        if (form.ref.value !== '') {
          // this.media.removeFile(media.ref.value);
        }
  
        const newRef = form.newRef.value;
        const fileName = newRef.substr(newRef.lastIndexOf('/') + 1);
        // this.media.uploadBlob(media.newRef.value, media.blob, fileName);
        form.ref.setValue(form.newRef.value);
      }
  
      form.blob.setValue('');
      form.newRef.setValue('');
      form.delete.setValue(false);
    })
  
  }

  public removeMediaValues(formValue) {

    for (const key in formValue) {
      if (key === 'media') {
        delete formValue[key];
      } else if (typeof formValue[key] === 'object' && !!formValue[key]) {
        this.removeMediaValues(formValue[key]);
      }
    }
  
    return formValue;
  
  }

}

function searchForMediaRef(object: any): ImgRefForm[] {
  let imgRefs = [];

  if ("controls" in object) {
    for (const key in object.controls) {
      const control = object.controls[key]
      if (isImgRef(control)) {
        imgRefs.push(control);
      } else if (typeof control === 'object' && !!control) { // null is an object
        const childRefs = searchForMediaRef(control);
        imgRefs = imgRefs.concat(childRefs);
      }
    }
  }
  
  return imgRefs;
}

function isImgRef(object): boolean {
  return object?.constructor?.name === 'ImgRefForm' ? true : false;
}
