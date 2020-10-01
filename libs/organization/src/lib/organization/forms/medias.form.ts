import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { HostedMediaWithMetadataForm } from '@blockframes/media/form/media-with-metadata.form';
import { createOrgMedias, OrgMedias } from '@blockframes/organization/+state/organization.firestore';
import { FormList } from '@blockframes/utils/form';

function createOrgMediasControl(orgDocs: OrgMedias) {
  const entity = createOrgMedias(orgDocs);
  return {
    notes: FormList.factory(entity.notes, note => new HostedMediaWithMetadataForm(note)),
  }
}

type OrgMediasControl = ReturnType<typeof createOrgMediasControl>;

export class OrganizationMediasForm extends FormEntity<OrgMediasControl> {
  constructor(data?: OrgMedias) {
    super(createOrgMediasControl(data));
  }

  get notes() {
    return this.get('notes');
  }
}
