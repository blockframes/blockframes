import { FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { createStorageFile, StorageFile } from '../+state/media.firestore';

// ------------------------------
//          File Meta Data
// ------------------------------

function createStorageFileControl(storageFile: Partial<StorageFile> = {}) {
  const file = createStorageFile(storageFile);
  return {
    privacy: new FormControl(file.privacy),
    collection: new FormControl(file.collection),
    docId: new FormControl(file.docId),
    field: new FormControl(file.field),
    storagePath: new FormControl(file.storagePath),
  };
}

type StorageFileControl = ReturnType<typeof createStorageFileControl>;

export class StorageFileForm extends FormEntity<StorageFileControl> {
  constructor(storageFile: Partial<StorageFile> = {}) {
    const control = createStorageFileControl(storageFile);
    super(control);
  }

  get storagePath() { return this.get('storagePath') };
}
