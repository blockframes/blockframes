import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createStorageFile, StorageFile, CollectionHoldingFile } from '@blockframes/model';
import { FileLabel, getFileMetadata } from '../utils';
import { getDownloadURL } from 'firebase/storage';
import { FireStorage } from 'ngfire';

@Pipe({
  name: 'storageFile',
  pure: true
})
export class StorageFilePipe implements PipeTransform {
  transform(value: StorageFile | string, collection: CollectionHoldingFile, label: FileLabel, docId: string) {
    if (typeof value !== 'string') return value;
    const metadata = getFileMetadata(collection, label, docId);
    return createStorageFile({
      storagePath: value,
      ...metadata
    });
  }
}

@Pipe({ name: 'getDownloadUrl' })
export class DownloadUrl implements PipeTransform {
  constructor(private storage: FireStorage) { }
  transform(storageFile: StorageFile, basePath: 'protected' | 'public' = 'public'): Promise<string> {
    const pathReference = this.storage.ref(`/${basePath}/${storageFile.storagePath}`);
    return getDownloadURL(pathReference);
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [StorageFilePipe, DownloadUrl],
  exports: [StorageFilePipe, DownloadUrl],
})
export class StorageFileModule { }
