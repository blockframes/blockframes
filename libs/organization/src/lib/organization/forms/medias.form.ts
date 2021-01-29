import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { HostedMediaWithMetadataForm } from '@blockframes/media/form/media-with-metadata.form';
import { createOrgMedias, OrgMedias } from '@blockframes/organization/+state/organization.firestore';
import { FormList } from '@blockframes/utils/form';

function createOrgMediasControl(id: string, orgDocs: OrgMedias) {
  const entity = createOrgMedias(orgDocs);
  return {
    notes: FormList.factory(entity.notes, (note, i) => new HostedMediaWithMetadataForm(note, { privacy: 'protected', collection: 'orgs', docId: id ?? '', filed: `documents.notes[${i}]`})),
  }
}

type OrgMediasControl = ReturnType<typeof createOrgMediasControl>;

export class OrganizationMediasForm extends FormEntity<OrgMediasControl> {
  constructor(id: string, data?: OrgMedias) {
    super(createOrgMediasControl(id, data));
  }

  get notes() {
    return this.get('notes');
  }
}
