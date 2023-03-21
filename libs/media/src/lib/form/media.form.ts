import { UntypedFormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { createStorageFile, StorageFile, Privacy } from '@blockframes/model';

// ------------------------------
//          File Meta Data
// ------------------------------

function createStorageFileControl(storageFile: Partial<StorageFile> = {}) {
  const file = createStorageFile(storageFile);
  return {
    privacy: new UntypedFormControl(file.privacy),
    collection: new UntypedFormControl(file.collection),
    docId: new UntypedFormControl(file.docId),
    field: new UntypedFormControl(file.field),
    storagePath: new UntypedFormControl(file.storagePath),
  };
}

type StorageFileControl = ReturnType<typeof createStorageFileControl>;

export class StorageFileForm extends FormEntity<StorageFileControl> {
  constructor(storageFile: Partial<StorageFile> = {}) {
    const control = createStorageFileControl(storageFile);
    super(control);
  }

  get storagePath() { return this.get('storagePath') };

  get isPublic(): boolean {
    return this.get('privacy').value === 'public';
  }

  togglePrivacy(isPublic: boolean) {
    const privacy: Privacy = isPublic ? 'public' : 'protected';
    this.get('privacy').setValue(privacy);
  }
}
