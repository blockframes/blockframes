import { FormControl, FormGroup } from '@angular/forms';
import { FormList } from '@blockframes/utils';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { Injectable } from '@angular/core';
import { createContract, createPartyDetails, ContractVersion } from '@blockframes/contract/+state/contract.model';
import { Contract } from './../+state/contract.model';
import { ContractPartyForm } from './party-name/party-name.form';
import { ContractPartyDetail } from '../+state/contract.model';
import { ContractTitleDetail } from '../+state';

function createContractControls(contract: Partial<Contract>) {
  const entity = createContract(contract);
  return {
    parties: FormList.factory(entity.parties, partyDetails => new PartyDetailsForm(partyDetails)),
    titleIds: new FormControl(contract.titleIds),
    lastVersion: new ContractVersionForm(contract.lastVersion)
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
    party: new ContractPartyForm(entity.party),
    status: new FormControl(entity.status || 'accepted' )
  };
}

type PartyDetailsControl = ReturnType<typeof createPartyDetailsControls>;

export class PartyDetailsForm extends FormEntity<PartyDetailsControl> {
  constructor(partyDetails: Partial<ContractPartyDetail> = {}) {
    super(createPartyDetailsControls(partyDetails));
  }
}

function createContractVersionControls(contractVersion: Partial<ContractVersion> = {}) {
  const movieIds = Object.keys(contractVersion.titles );
  return {
    titles: new ContractTitleDetailForm(contractVersion.titles)
  }
}

type ContractVersionControl = ReturnType<typeof createContractVersionControls>

export class ContractVersionForm extends FormEntity<ContractVersionControl> {
  constructor(contractVersion: Partial<ContractVersion> = {}) {
    super(createContractVersionControls(contractVersion))
  }
}

function createContractTitleDetailControls(titleDetail: Partial<ContractTitleDetail>) {
  return {
    distributionDealIds: FormList.factory(titleDetail.distributionDealIds)
  }
}


type ContractTitleDetailControl = ReturnType<typeof createContractVersionControls>
  
  export class ContractTitleDetailForm extends FormEntity<ContractTitleDetailControl> {
    constructor(titleDetail: Record<string, Partial<ContractTitleDetail>> = {}){
      super(createContractTitleDetailControls(titleDetail))
    }
  }