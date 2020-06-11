import { Injectable } from "@angular/core";
import { AngularFireStorage, AngularFireUploadTask } from "@angular/fire/storage";
import { MediaStore, isUploading } from "./media.store";
import { MediaQuery } from "./media.query";
import { UploadFile } from "./media.firestore";

@Injectable({ providedIn: 'root' })
export class MediaService {

  private tasks: Record<string, AngularFireUploadTask>;

  constructor(
    private store: MediaStore,
    private query: MediaQuery,
    private storage: AngularFireStorage,
  ) { }

  /** Check if a file exists in the **Firebase storage** */
  exists(path: string) {
    return this.storage.ref(path).getDownloadURL().toPromise().then(() => true).catch(() => false);
  }

  uploadBlob(uploadFiles: UploadFile | UploadFile[]): Promise<void> | Promise<void>[] {
    if (Array.isArray(uploadFiles)) {
      return uploadFiles.map(uploadFile => this.uploadBlob(uploadFile) as Promise<void>);
    } else {
      return this.upload(uploadFiles.ref, uploadFiles.data, uploadFiles.fileName);
    }
  }

  uploadFile(path: string, file: File) {
    return this.upload(path, file, file.name);
  }

  private async upload(path: string, fileOrBlob: Blob | File, fileName: string) {
    const exists = await this.exists(path);

    if (exists) {
      throw new Error(`Upload Error : there is already a file @ ${path}, please delete it before uploading a new file!`);
    }

    const uploading = this.query.isUploading(fileName);
    if (uploading) {
      throw new Error(`Upload Error : A file named ${fileName} is already uploading!`);
    }

    const task = this.storage.upload(path, fileOrBlob);

    this.store.upsert(fileName, {
      status: 'uploading',
      progress: 0,
    });

    task.percentageChanges().subscribe(p => this.store.update(fileName, {progress: p}));

    this.tasks[fileName] = task;

    task.then(
      // on success
      () => {
        this.store.update(fileName, {status: 'succeeded'});
        delete this.tasks[fileName];
      },

      // on error (cancelled is treated by firebase as an error)
      () => {
        this.store.update(fileName, {status: 'canceled'});
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

  /** Remove every `succeeded` and `canceled` upload */
  clear() {
    this.store.remove(upload => isUploading(upload));
  }
}
