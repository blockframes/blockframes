import { FormEntity } from '@blockframes/utils';
import { FormControl } from '@angular/forms';
import { Party, createParty } from '@blockframes/utils/common-interfaces/identity';

function createPartyControl(party: Partial<Party>) {
    const entity = createParty(party);
    return {
        displayName: new FormControl(entity.displayName)
    }
}

type ContractPartyControl = ReturnType<typeof createPartyControl>;

export class ContractPartyForm extends FormEntity<ContractPartyControl>{
    constructor(party: Partial<Party>) {
        super(createPartyControl(party))
    }
}