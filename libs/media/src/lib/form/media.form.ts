import { FormControl } from '@angular/forms';
import { Privacy } from '@blockframes/utils/file-sanitizer';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { createStorageFile, StorageFile } from '@blockframes/shared/model';

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

  get storagePath() {
    return this.get('storagePath');
  }

  get isPublic(): boolean {
    return this.get('privacy').value === 'public';
  }

  togglePrivacy(isPublic: boolean) {
    const privacy: Privacy = isPublic ? 'public' : 'protected';
    this.get('privacy').setValue(privacy);
  }
}
