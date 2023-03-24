import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { StorageFileForm } from '@blockframes/media/form/media.form';
import { createOrganization, getAllAppsExcept, Organization } from '@blockframes/model';
import { OrganizationAddressesForm } from '@blockframes/organization/forms/organization.form';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { ModuleAccessCrmForm } from './module-access-crm.form';

function createOrgCrmControls(entity: Partial<Organization>) {
  const org = createOrganization(entity);
  const appAccess = new UntypedFormGroup({});
  const apps = getAllAppsExcept(['crm']);
  for (const a of apps) {
    appAccess.addControl(a, new ModuleAccessCrmForm(org.appAccess[a]));
  }
  return {
    name: new UntypedFormControl(org.name),
    description: new UntypedFormControl(org.description),
    addresses: new OrganizationAddressesForm(org.addresses),
    email: new UntypedFormControl(org.email, Validators.email),
    activity: new UntypedFormControl(org.activity),
    logo: new StorageFileForm(org.logo),
    appAccess,
    status: new UntypedFormControl(org.status),
  };
}

type OrgCrmControl = ReturnType<typeof createOrgCrmControls>;

export class OrganizationCrmForm extends FormEntity<OrgCrmControl> {
  constructor(data?: Organization) {
    super(createOrgCrmControls(data));
  }

  get appAccess() {
    return this.get('appAccess');
  }
}
