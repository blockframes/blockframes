import { Injectable } from "@angular/core";
import { AngularFireStorage, AngularFireUploadTask } from "@angular/fire/storage";
import { sanitizeFileName } from "../file-sanitizer";
import { MediaStore } from "./media.store";
import { MediaQuery } from "./media.query";



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

  async uploadBlob(path: string, data: Blob, fileName: string) {
    return this.upload(path, data, fileName);
  }

  async uploadFile(path: string, file: File) {
    return this.upload(path, file, file.name);
  }

  private async upload(path: string, fileOrBlob: Blob | File, fileName: string) {
    const exists = await this.exists(path);

    if (exists) {
      throw new Error(`Upload Error : there is already a file @ ${path}, please delete it before uploading a new file!`);
    }

    const isUploading = this.query.isUploading(fileName);
    if (isUploading) {
      throw new Error(`Upload Error : A file named ${fileName} is already uploading!`);
    }

    const task = this.storage.upload(path, fileOrBlob, {name: sanitizeFileName(fileName)});

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
    if (this.query.hasEntity(fileName)) {
      this.tasks[fileName].pause();
      this.store.update(fileName, { status: 'paused' });
    }
  }

  resume(fileName: string) {
    if (this.query.hasEntity(fileName)) {
      this.tasks[fileName].resume();
      this.store.update(fileName, { status: 'uploading' });
    }
  }

  cancel(fileName: string) {
    if (this.query.hasEntity(fileName)) {
      this.tasks[fileName].cancel();
      this.store.update(fileName, { status: 'canceled' });
    }
  }

  /** Remove every `succeeded` and `canceled` upload */
  clear() {
    this.store.remove(upload => upload.status === 'succeeded' || upload.status === 'canceled');
  }
}
