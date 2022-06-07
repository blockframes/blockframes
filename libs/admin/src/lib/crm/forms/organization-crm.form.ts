import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { ModuleAccessCrmForm } from './module-access-crm.form';
import { OrganizationDenominationForm, OrganizationAddressesForm } from '@blockframes/organization/forms/organization.form';
import { StorageFileForm } from '@blockframes/media/form/media.form';
import { createOrganization, Organization, getAllAppsExcept } from '@blockframes/model';

function createOrgCrmControls(entity: Partial<Organization>) {
  const org = createOrganization(entity);
  const appAccess = new FormGroup({});
  const apps = getAllAppsExcept(['crm']);
  for (const a of apps) {
    appAccess.addControl(a, new ModuleAccessCrmForm(org.appAccess[a]))
  }
  return {
    name: new OrganizationDenominationForm(org.name),
    description: new FormControl(org.description),
    addresses: new OrganizationAddressesForm(org.addresses),
    email: new FormControl(org.email, Validators.email),
    activity: new FormControl(org.activity),
    logo: new StorageFileForm(org.logo),
    appAccess,
    status: new FormControl(org.status),
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
