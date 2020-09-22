import { FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { HostedMediaForm } from './media.form';
import { createOrgMediaWithMetadata, OrgMediaWithMetadata } from '@blockframes/organization/+state';

function createHostedMediaWithMetadataControl(doc: Partial<OrgMediaWithMetadata>) {
  const entity = createOrgMediaWithMetadata(doc);
  return {
   ref: new HostedMediaForm(entity.ref),
   title: new FormControl(entity.title),
  }
}

export type HostedMediaWithMetadataControl = ReturnType<typeof createHostedMediaWithMetadataControl>;

export class HostedMediaWithMetadataForm extends FormEntity<HostedMediaWithMetadataControl> {
  constructor(doc?: Partial<OrgMediaWithMetadata>) {
    const control = createHostedMediaWithMetadataControl(doc);
    super(control);
  }

}
