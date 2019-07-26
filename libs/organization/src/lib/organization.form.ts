import { FormControl, FormArray } from '@angular/forms';
import { FormEntity, FormField, FormList } from '@blockframes/utils';
import { Organization, createOrganization, OrganizationAction, OrganizationMember } from './+state';

interface OrganizationControl {
  name: FormControl;
  address: FormControl;
  actions: FormList<OrganizationAction>;
}

interface OrganizatoinActionControl {
  activeMembers: FormField<OrganizationMember[]>;
  quorumMembers: FormControl;
}

export class OrganizationActionForm extends FormEntity<
  OrganizationAction,
  OrganizatoinActionControl
> {
  constructor(action: OrganizationAction) {
    super({
      activeMembers: new FormField<OrganizationMember[]>(action.activeMembers),
      quorumMembers: new FormControl(action.quorumMembers)
    });
  }
  
  get activeMembers() {
    return this.get('activeMembers');
  }

  removeMember(id: string) {
    const activeMembers = this.value.activeMembers.filter(member => member.uid !== id);
    this.patchValue({ activeMembers });
  }
}

export class OrganizationForm extends FormEntity<Organization, OrganizationControl> {
  constructor(organization: Partial<Organization> = {}) {
    const org = createOrganization(organization);
    super({
      name: new FormControl(org.name),
      address: new FormControl(org.address),
      actions: FormList.factory(org.actions, action => new OrganizationActionForm(action))
    });
  }
  action(index: number): OrganizationActionForm {
    return (<FormArray>this.get('actions')).at(index) as OrganizationActionForm;
  }
}
