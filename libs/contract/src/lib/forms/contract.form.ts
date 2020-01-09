import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { Injectable } from '@angular/core';
import { createContract } from '@blockframes/contract/+state/contract.model';
import { Contract } from './../+state/contract.model';

function createContractControls(contract: Partial<Contract>){
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