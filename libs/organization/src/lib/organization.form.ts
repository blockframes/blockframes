import { FormList } from './../../../utils/src/lib/form/forms/list.form';
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
      address: new FormControl(org.address),
      actions: FormList.factory(org.actions, (action) => new OrganizationActionForm(action))  // new FormArray(org.actions.map(action => ))
    });
  }
  action(index: number): OrganizationActionForm {
    return (<FormArray>this.get('actions')).at(index) as OrganizationActionForm;
  }
}