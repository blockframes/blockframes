import { FormControl } from '@angular/forms';
import { Party, createParty } from '@blockframes/utils/common-interfaces/identity';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { Injectable } from '@angular/core';
import { createContract } from '@blockframes/contract/+state/contract.model';
import { Contract } from './../+state/contract.model';

function createPartyControl(party?: Partial<Party[]>) {
    const entity = createParty(party);
    return {
        displayName: new FormControl(entity.displayName)
    }
}

type ContractPartyControl = ReturnType<typeof createPartyControl>;

class ContractPartiesForm extends FormEntity<ContractPartyControl>{
    constructor(party: Partial<Party[]>) {
        super(createPartyControl(party))
    }
}

function createContractControls(contract: Partial<Contract>) {
    const entity = createContract(contract);
    return {
        parties: new ContractPartiesForm(entity.parties),
    }
}

type ContractControl = ReturnType<typeof createContractControls>;

@Injectable()
export class ContractForm extends FormEntity<ContractControl> {
    constructor() {
        super(createContractControls({}))
    }
}
