import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createStorageFile, StorageFile } from '../+state/media.firestore';
import { CollectionHoldingFile, FileLabel, getFileMetadata } from '../+state/static-files';

@Pipe({
  name: 'storageFile',
  pure: true
})
export class StorageFilePipe implements PipeTransform {
  transform(value: StorageFile | string, collection: CollectionHoldingFile, label: FileLabel, docId: string ) {
    if (typeof value === "string") {
      const metadata = getFileMetadata(collection, label, docId)
      return createStorageFile({
        storagePath: value,
        ...metadata
      })
    } else return value;
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [StorageFilePipe],
  exports: [StorageFilePipe],
})
export class StorageFileModule {}
