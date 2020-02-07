import { FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils';
import { Organization, createOrganization } from '@blockframes/organization';


function createOrgAdminControls(entity: Partial<Organization>) {
  const org = createOrganization(entity);
  return {
    catalogDashboard: new FormControl(org.appAccess.catalogDashboard),
    catalogMarketplace: new FormControl(org.appAccess.catalogMarketplace),
    status: new FormControl(org.status),
  };
}

type OrgAdminControl = ReturnType<typeof createOrgAdminControls>;

export class OrganizationAdminForm extends FormEntity<OrgAdminControl> {
  constructor(data?: Organization) {
    super(createOrgAdminControls(data));
  }
}
