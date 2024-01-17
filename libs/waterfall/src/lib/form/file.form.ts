
import { UntypedFormControl } from '@angular/forms';

import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { createStorageFile, Privacy, WaterfallFile } from '@blockframes/model';



function createWaterfallFileControl(storageFile: (Partial<WaterfallFile> & { id: string })) {
  const file = createStorageFile(storageFile);
  return {
    privacy: new UntypedFormControl('protected'),
    collection: new UntypedFormControl(file.collection),
    docId: new UntypedFormControl(file.docId),
    field: new UntypedFormControl(file.field),
    storagePath: new UntypedFormControl(file.storagePath),
    id: new UntypedFormControl(storageFile.id),
  };
}

type WaterfallFileControl = ReturnType<typeof createWaterfallFileControl>;

export class WaterfallFileForm extends FormEntity<WaterfallFileControl> {
  constructor(storageFile: (Partial<WaterfallFile> & { id: string })) {
    const control = createWaterfallFileControl(storageFile);
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
