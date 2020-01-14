import { FormEntity } from '@blockframes/utils';
import { FormControl } from '@angular/forms';
import { Party } from '@blockframes/utils/common-interfaces/identity';

function createPartyControl(party: Partial<Party> = {}) {
  return {
    displayName: new FormControl(party.displayName)
  };
}

type ContractPartyControl = ReturnType<typeof createPartyControl>;

export class ContractPartyForm extends FormEntity<ContractPartyControl> {
  constructor(party: Partial<Party>) {
    super(createPartyControl(party));
  }
}
