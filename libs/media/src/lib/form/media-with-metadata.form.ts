import { FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { createHostedMediaWithMetadata, HostedMediaWithMetadata } from '../+state/media.firestore';
import { HostedMediaForm } from './media.form';


function createHostedMediaWithMetadataControl(doc: Partial<HostedMediaWithMetadata>) {
  const entity = createHostedMediaWithMetadata(doc);
  return {
    ref: new HostedMediaForm(entity.ref),
    title: new FormControl(entity.title),
  }
}

export type HostedMediaWithMetadataControl = ReturnType<typeof createHostedMediaWithMetadataControl>;

export class HostedMediaWithMetadataForm extends FormEntity<HostedMediaWithMetadataControl> {
  constructor(doc?: Partial<HostedMediaWithMetadata>) {
    const control = createHostedMediaWithMetadataControl(doc);
    super(control);
  }

}
