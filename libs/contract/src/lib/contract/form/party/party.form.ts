import { FormEntity } from '@blockframes/utils';
import { FormControl, Validators } from '@angular/forms';
import { Party } from '@blockframes/utils/common-interfaces/identity';

function createPartyControl(party: Partial<Party> = {}) {
  return {
    displayName: new FormControl(party.displayName, Validators.required),
    showName: new FormControl(party.showName),
    role: new FormControl(party.role),
  };
}

type ContractPartyControl = ReturnType<typeof createPartyControl>;

export class ContractPartyForm extends FormEntity<ContractPartyControl, Party> {
  constructor(party: Partial<Party>) {
    super(createPartyControl(party));
  }
}