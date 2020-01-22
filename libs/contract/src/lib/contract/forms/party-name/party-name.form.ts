import { FormEntity } from '@blockframes/utils';
import { FormControl } from '@angular/forms';
import { Party } from '@blockframes/utils/common-interfaces/identity';

function createPartyControl(party: Partial<Party> = {}) {
  console.log()
  return {
    displayName: new FormControl(party.displayName),
    showName: new FormControl(party.showName),
    role: new FormControl(party.role),
  };
}

type ContractPartyControl = ReturnType<typeof createPartyControl>;

export class ContractPartyForm extends FormEntity<ContractPartyControl> {
  constructor(party: Partial<Party>) {
    super(createPartyControl(party));
  }
}