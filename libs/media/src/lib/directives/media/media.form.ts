import { HostedMedia, createHostedMedia } from '../../+state//media.firestore'
import { FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';

function createHostedMediaControl(media: HostedMedia) {
  const { ref, url } = createHostedMedia(media);
  return {
    ref: new FormControl(ref),
    url: new FormControl(url),
    blob: new FormControl(),
    delete: new FormControl(false),
    fileName: new FormControl('')
  }
}

export type HostedMediaControl = ReturnType<typeof createHostedMediaControl>;

export class HostedMediaForm extends FormEntity<HostedMediaControl> {
  constructor(media: Partial<HostedMedia> = {}) {
    const hostedMedia = createHostedMedia(media);
    const control = createHostedMediaControl(hostedMedia);
    super(control);
  }

  get ref() { return this.get('ref') }
  get url() { return this.get('url') }
  get blob() { return this.get('blob') }
  get delete() { return this.get('delete') }
  get fileName() { return this.get('fileName') }
}
