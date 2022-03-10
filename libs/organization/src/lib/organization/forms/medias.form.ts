import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { FormList } from '@blockframes/utils/form';
import { StorageFileForm } from '@blockframes/media/form/media.form';
import { createOrgMedias, OrgMedias } from '@blockframes/model';

function createOrgMediasControl(orgDocs: OrgMedias) {
  const entity = createOrgMedias(orgDocs);
  return {
    notes: FormList.factory(entity.notes, note => new StorageFileForm(note)),
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
