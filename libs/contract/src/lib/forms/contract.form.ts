import { FormList } from '@blockframes/utils';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { Injectable } from '@angular/core';
import { createContract, createPartyDetails } from '@blockframes/contract/+state/contract.model';
import { Contract } from './../+state/contract.model';
import { ContractPartyForm } from './party-name/party-name.form';
import { ContractPartyDetail } from '../+state/contract.model';

function createContractControls(contract: Partial<Contract>) {
  const entity = createContract(contract);
  return {
    parties: FormList.factory(entity.parties, partyDetails => new PartyDetailsForm(partyDetails))
  };
}

type ContractControl = ReturnType<typeof createContractControls>;

@Injectable()
export class ContractForm extends FormEntity<ContractControl> {
  constructor() {
    super(createContractControls({}));
  }
}

// PARTY DETAILS

function createPartyDetailsControls(partyDetails: Partial<ContractPartyDetail> = {}) {
  const entity = createPartyDetails(partyDetails);
  return {
    party: new ContractPartyForm(entity.party)
  };
}

type PartyDetailsControl = ReturnType<typeof createPartyDetailsControls>;

export class PartyDetailsForm extends FormEntity<PartyDetailsControl> {
  constructor(partyDetails: Partial<ContractPartyDetail>) {
    super(createPartyDetailsControls(partyDetails));
  }
}
