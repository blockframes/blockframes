import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { Organization, createOrganization } from '@blockframes/organization/+state/organization.model';
import { ModuleAccessAdminForm } from './module-access-admin.form';
import { getAllAppsExcept } from '@blockframes/utils/apps';
import { OrganizationDenominationForm, OrganizationAddressesForm } from '@blockframes/organization/forms/organization.form';
import { StorageFileForm } from '@blockframes/media/form/media.form';

function createOrgAdminControls(entity: Partial<Organization>) {
  const org = createOrganization(entity);
  const appAccess = new FormGroup({});
  const apps = getAllAppsExcept(['crm']);
  for (const a of apps) {
    appAccess.addControl(a, new ModuleAccessAdminForm(org.appAccess[a]))
  }
  return {
    denomination: new OrganizationDenominationForm(org.denomination),
    description: new FormControl(org.description),
    addresses: new OrganizationAddressesForm(org.addresses),
    email: new FormControl(org.email, Validators.email),
    fiscalNumber: new FormControl(org.fiscalNumber),
    activity: new FormControl(org.activity),
    logo: new StorageFileForm(org.logo),
    appAccess,
    status: new FormControl(org.status),
  };
}

type OrgAdminControl = ReturnType<typeof createOrgAdminControls>;

export class OrganizationAdminForm extends FormEntity<OrgAdminControl> {
  constructor(data?: Organization) {
    super(createOrgAdminControls(data));
  }

  get appAccess() {
    return this.get('appAccess');
  }
}
