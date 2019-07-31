import { FormControl, FormArray } from '@angular/forms';
import { FormEntity, FormField, FormList } from '@blockframes/utils';
import { Organization, createOrganization, OrganizationMember, OrganizationOperation } from './+state';

interface OrganizationControl {
  name: FormControl;
  address: FormControl;
  operations: FormList<OrganizationOperation>;
}

interface OrganizationOperationControl {
  members: FormField<OrganizationMember[]>;
  quorum: FormControl;
}

export class OrganizationOperationForm extends FormEntity<
OrganizationOperation,
  OrganizationOperationControl
> {
  constructor(operation: OrganizationOperation) {
    super({
      members: new FormField<OrganizationMember[]>(operation.members),
      quorum: new FormControl(operation.quorum)
    });
  }

  get activeMembers() {
    return this.get('members');
  }

  removeMember(id: string) {
    const members = this.value.members.filter(member => member.uid !== id);
    this.patchValue({ members });
  }
}

// export class OrganizationForm extends FormEntity<Organization, OrganizationControl> {
//   constructor(organization: Partial<Organization> = {}) {
//     const org = createOrganization(organization);
//     super({
//       name: new FormControl(org.name),
//       address: new FormControl(org.address),
//       operations: FormList.factory(org.operations, operation => new OrganizationOperationForm(operation))
//     });
//   }
//   operation(operation: OrganizationOperation): OrganizationOperationForm {
//     return this.get('operations').
//      at(index) as OrganizationOperationForm;
//   }
// }
