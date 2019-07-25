import { FormControl, FormArray } from '@angular/forms';
import { FormEntity } from '@blockframes/utils';
import { Organization, createOrganization, OrganizationAction } from './+state';

export class OrganizationActionForm extends FormEntity<OrganizationAction> {
  constructor(action: OrganizationAction) {
    super({
      activeMembers: new FormControl(action.activeMembers),
      quorumMembers: new FormControl(action.quorumMembers)
    });
  }

  removeMember(id: string) {
    const activeMembers = this.value.activeMembers.filter(member => member.uid !== id);
    this.patchValue({ activeMembers });
  }
}

export class OrganizationForm extends FormEntity<Organization> {
  constructor(organization: Partial<Organization> = {}) {
    const org = createOrganization(organization);
    super({
      name: new FormControl(org.name),
      actions: new FormArray(org.actions.map(action => new OrganizationActionForm(action)))
    });
  }
  action(index: number): OrganizationActionForm {
    return (<FormArray>this.get('actions')).at(index) as OrganizationActionForm;
  }
  patchValue(org: Organization) {
    super.patchValue(org);
    org.actions.forEach((action, i) => {
      this.action(i)
        ? this.action(i).patchValue(action) // If there is a form already patch it
        : (this.get('actions') as FormArray).setControl(i, new OrganizationActionForm(action)) // else create one
    });
  }
}