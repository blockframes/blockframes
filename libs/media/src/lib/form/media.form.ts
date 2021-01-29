import { FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { getFileNameFromPath } from '@blockframes/media/+state/media.model';
import { FileMetaData } from '../+state/media.firestore';
import { privacies } from '@blockframes/utils/file-sanitizer';


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

// ! @deprecated Everything bellow should be removed during issue#4002

// ------------------------------
//          Hosted Media
// ------------------------------

function createHostedMediaControl(ref: string, metadata: Partial<FileMetaData>) {
  return {
    oldRef: new FormControl(ref),
    ref: new FormControl(ref),
    blobOrFile: new FormControl(),
    fileName: new FormControl(getFileNameFromPath(ref)),
    cropped: new FormControl(false),
    metadata: new FileMetaDataForm(metadata),
  }
}

export type HostedMediaControl = ReturnType<typeof createHostedMediaControl>;

export class HostedMediaForm extends FormEntity<HostedMediaControl> {
  constructor(ref?: string, metadata?: Partial<FileMetaData>) {
    const control = createHostedMediaControl(ref ?? '', metadata);
    super(control);
  }

  get oldRef() { return this.get('oldRef') }
  get ref() { return this.get('ref') }
  get blobOrFile() { return this.get('blobOrFile') }
  get fileName() { return this.get('fileName') }
  get cropped() { return this.get('cropped') }

  markForDelete() {
    this.get('ref').patchValue('');
    this.markAsDirty();
  }
}
