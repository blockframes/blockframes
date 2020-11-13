import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { Organization, createOrganization } from '@blockframes/organization/+state/organization.model';
import { ModuleAccessAdminForm } from './module-access-admin.form';
import { app } from '@blockframes/utils/apps';
import { OrganizationDenominationForm, OrganizationAddressesForm } from '@blockframes/organization/forms/organization.form';
import { HostedMediaForm } from '@blockframes/media/form/media.form';

function createOrgAdminControls(entity: Partial<Organization>) {
  const org = createOrganization(entity);
  const appAccess = new FormGroup({});
  for (const a of app) {
    appAccess.addControl(a, new ModuleAccessAdminForm(org.appAccess[a]))
  }
  return {
    denomination: new OrganizationDenominationForm(org.denomination),
    description: new FormControl(org.description),
    addresses: new OrganizationAddressesForm(org.addresses),
    email: new FormControl(org.email, Validators.email),
    fiscalNumber: new FormControl(org.fiscalNumber),
    activity: new FormControl(org.activity),
    logo: new HostedMediaForm(org.logo),
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
