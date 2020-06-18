// Angular
import { Injectable } from "@angular/core";
import { AngularFireStorage, AngularFireUploadTask } from "@angular/fire/storage";
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

// State
import { MediaStore, isDone } from "./media.store";
import { MediaQuery } from "./media.query";
import { UploadFile, ImgRef } from "./media.firestore";

// Blockframes
import { UploadWidgetComponent } from '@blockframes/ui/upload/widget/upload-widget.component';
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
      const sanitizedFileName = sanitizeFileName(uploadFiles.fileName).replace(/(\.[\w\d_-]+)$/i, '.webp');
      this.upload(uploadFiles.path, uploadFiles.data, uploadFiles.fileName, sanitizedFileName);
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
      const sanitizedFileName = sanitizeFileName(file.name);
      this.upload(path, file, sanitizedFileName, file.name);
    } else {
      const promises = [];
      for (let index = 0; index < file.length; index++) {
        const sanitizedFileName = sanitizeFileName(file.item(index).name);
        promises.push(this.upload(path, file.item(index), file.item(index).name, sanitizedFileName))
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
  private async upload(path: string, fileOrBlob: Blob | File, fileName: string, sanitizedFileName: string) {
    const exists = await this.exists(path.concat(sanitizedFileName));
    this.showWidget();

    if (exists) {
      throw new Error(`Upload Error : there is already a file @ ${path}, please delete it before uploading a new file!`);
    }

    const uploading = this.query.isUploading(fileName);
    if (uploading) {
      throw new Error(`Upload Error : A file named ${fileName} is already uploading!`);
    }

    const task = this.storage.upload(path.concat(sanitizedFileName), fileOrBlob);

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

  uploadOrDeleteMedia(medias: ImgRef[]) {
    medias.forEach(imgRef => {
      if (imgRef.delete && imgRef.ref) {  
        this.removeFile(imgRef.ref);
      } else if (!!imgRef.blob) {
        if (imgRef.ref !== '') {
          this.removeFile(imgRef.ref);
        }
        const file: UploadFile = {
          path: imgRef.path,
          data: imgRef.blob,
          fileName: imgRef.fileName
        }
        this.uploadBlob(file);
      }
    })
  }
}
