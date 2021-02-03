import { FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { createHostedMediaWithMetadata, HostedMediaWithMetadata } from '../+state/media.firestore';
import { FileMetaData } from '../+state/media.model';
import { HostedMediaForm } from './media.form';


function createHostedMediaWithMetadataControl(doc: Partial<HostedMediaWithMetadata>, metadata: Partial<FileMetaData>) {
  const entity = createHostedMediaWithMetadata(doc);
  return {
    ref: new HostedMediaForm(entity.ref, metadata),
    title: new FormControl(entity.title),
  }
}

export type HostedMediaWithMetadataControl = ReturnType<typeof createHostedMediaWithMetadataControl>;

export class HostedMediaWithMetadataForm extends FormEntity<HostedMediaWithMetadataControl> {
  constructor(doc?: Partial<HostedMediaWithMetadata>, metadata?: Partial<FileMetaData>) {
    const control = createHostedMediaWithMetadataControl(doc, metadata);
    super(control);
  }

}
