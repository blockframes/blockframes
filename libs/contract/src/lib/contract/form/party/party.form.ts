import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { FormControl, Validators } from '@angular/forms';
import { Party, createParty } from '@blockframes/utils/common-interfaces/identity';

function createPartyControl(party: Partial<Party> = {}) {
  const entity = createParty(party)
  return {
    displayName: new FormControl(entity.displayName, Validators.required),
    showName: new FormControl(entity.showName),
    role: new FormControl(entity.role),
    orgId: new FormControl(entity.orgId)
  };
}

type ContractPartyControl = ReturnType<typeof createPartyControl>;

export class ContractPartyForm extends FormEntity<ContractPartyControl, Party> {
  constructor(party: Partial<Party>) {
    super(createPartyControl(party));
  }
}
