import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createStorageFile, StorageFile } from '../+state/media.firestore';
import { CollectionHoldingFile, FileLabel, getFileMetadata } from '../+state/static-files';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';

@Pipe({
  name: 'storageFile',
  pure: true
})
export class StorageFilePipe implements PipeTransform {
  transform(value: StorageFile | string, collection: CollectionHoldingFile, label: FileLabel, docId: string) {
    if (typeof value === "string") {
      const metadata = getFileMetadata(collection, label, docId)
      return createStorageFile({
        storagePath: value,
        ...metadata
      })
    } else return value;
  }
}

@Pipe({ name: 'getDownloadUrl' })
export class DownloadUrl implements PipeTransform {
  constructor(private storage: AngularFireStorage) { }
  transform(storageFile: StorageFile, basePath: 'protected' | 'public' = 'public'): Observable<string> {
    const pathReference = this.storage.ref(`/${basePath}/${storageFile.storagePath}`);
    console.log({storageFile})
    return pathReference.getDownloadURL()
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [StorageFilePipe, DownloadUrl],
  exports: [StorageFilePipe, DownloadUrl],
})
export class StorageFileModule { }
