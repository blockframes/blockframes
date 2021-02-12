import { FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { FileMetaData } from '../+state/media.model';
import { privacies } from '@blockframes/utils/file-sanitizer';
import { StorageFile } from '../+state/media.firestore';


// ------------------------------
//          File Meta Data
// ------------------------------

function createFileMetaDataControl(metadata: Partial<FileMetaData>) {
  return {
    privacy: new FormControl(metadata?.privacy ?? privacies[0]), // public by default
    uid: new FormControl(metadata?.uid ?? ''),
    collection: new FormControl(metadata?.collection ?? ''),
    docId: new FormControl(metadata?.docId ?? ''),
    field: new FormControl(metadata?.field ?? ''),
  }
}

export type FileMetaDataControl = ReturnType<typeof createFileMetaDataControl>;

export class FileMetaDataForm extends FormEntity<FileMetaDataControl> {
  constructor(metadata: Partial<FileMetaData>) {
    const control = createFileMetaDataControl(metadata);
    super(control);
  }
}



function createStorageFileControl(storageFile?: Partial<StorageFile>) {
  return {
    storagePath: new FormControl(storageFile?.storagePath ?? ''),
  };
}

export type StorageFileControl = ReturnType<typeof createStorageFileControl>;

export class StorageFileForm extends FormEntity<StorageFileControl> {
  constructor(storageFile?: Partial<StorageFile>) {
    const control = createStorageFileControl(storageFile);
    super(control);
  }
}
