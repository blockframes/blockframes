import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createStorageFile, StorageFile } from '../+state/media.firestore';
import { CollectionHoldingFile, FileLabel, getFileMetadata } from '../+state/static-files';
import { getDownloadURL, ref, Storage } from '@angular/fire/storage';

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
  constructor(private storage: Storage) { }
  transform(storageFile: StorageFile, basePath: 'protected' | 'public' = 'public'): Promise<string> {
    const pathReference = ref(this.storage, `/${basePath}/${storageFile.storagePath}`);
    return getDownloadURL(pathReference); // TODO #7273 test
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [StorageFilePipe, DownloadUrl],
  exports: [StorageFilePipe, DownloadUrl],
})
export class StorageFileModule { }
