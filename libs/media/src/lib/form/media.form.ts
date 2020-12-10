import { FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { getFileNameFromPath } from '@blockframes/media/+state/media.model';

// ------------------------------
//          Hosted Media
// ------------------------------

function createHostedMediaControl(ref: string) {
  return {
    oldRef: new FormControl(ref),
    ref: new FormControl(ref),
    blobOrFile: new FormControl(),
    fileName: new FormControl(getFileNameFromPath(ref)),
    cropped: new FormControl(false)
  }
}

export type HostedMediaControl = ReturnType<typeof createHostedMediaControl>;

export class HostedMediaForm extends FormEntity<HostedMediaControl> {
  constructor(ref?: string) {
    const control = createHostedMediaControl(ref ?? '');
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
