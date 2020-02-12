import { FormControl } from '@angular/forms';
import { Injectable } from '@angular/core';
import { urlValidators } from '@blockframes/utils/form/validators';
import { FormStaticValue, FormList, FormEntity } from '@blockframes/utils/form';
import {
  createContract,
  createContractPartyDetail,
  Contract,
  ContractPartyDetail,
  createLegalDocument,
  createLegalDocuments,
  LegalDocument,
  LegalDocuments,
} from '../+state';
import { ContractPartyForm } from './party/party.form';
import { ContractVersionForm } from '@blockframes/contract/version/form/version.form';

// PARTY DETAILS

function createPartyDetailsControls(partyDetails: Partial<ContractPartyDetail> = {}) {
  const entity = createContractPartyDetail(partyDetails);
  return {
    party: new ContractPartyForm(entity.party),
    status: new FormControl(entity.status),
    childRoles: new FormControl(partyDetails.childRoles)
  };
}

type PartyDetailsControl = ReturnType<typeof createPartyDetailsControls>;

export class PartyDetailsForm extends FormEntity<PartyDetailsControl> {
  constructor(partyDetails?: Partial<ContractPartyDetail>) {
    super(createPartyDetailsControls(partyDetails));
  }
}

// LEGAL DOCUMENTS

function createLegalDocumentControl(legalDocument?: Partial<LegalDocument>) {
  const { id, label, media, language, country } = createLegalDocument(legalDocument);
  return {
    id: new FormControl(id),
    label: new FormControl(label),
    media: new FormControl(media.url, urlValidators),
    language: new FormStaticValue(language, 'LANGUAGES'),
    country: new FormStaticValue(country, 'TERRITORIES')
  };
}

export type LegalDocumentControl = ReturnType<typeof createLegalDocumentControl>;

export class LegalDocumentForm extends FormEntity<LegalDocumentControl> {
  constructor(legalDocument?: Partial<LegalDocument>) {
    super(createLegalDocumentControl(legalDocument));
  }
}

function createLegalDocumentsControl(legalDocuments?: Partial<LegalDocuments>) {
  const entity = createLegalDocuments(legalDocuments);
  return {
    chainOfTitles: FormList.factory(entity.chainOfTitles, el => new LegalDocumentForm(el)),
    invoices: FormList.factory(entity.invoices, el => new LegalDocumentForm(el))
  };
}

export type LegalDocumentsControl = ReturnType<typeof createLegalDocumentsControl>;

export class LegalDocumentsForm extends FormEntity<LegalDocumentsControl> {
  constructor(legalDocuments?: Partial<LegalDocuments>) {
    super(createLegalDocumentsControl(legalDocuments));
  }
}

// CONTRACT


function createContractControls(contract: Partial<Contract>) {
  const entity = createContract(contract);
  return {
    id: new FormControl(contract.id),
    parties: FormList.factory(entity.parties, partyDetails => new PartyDetailsForm(partyDetails)),
    documents: new LegalDocumentsForm(entity.documents),
    titleIds: FormList.factory(contract.titleIds),
    versions: FormList.factory(contract.versions, version => new ContractVersionForm(version))
  };
}

type ContractControl = ReturnType<typeof createContractControls>;

@Injectable()
export class ContractForm extends FormEntity<ContractControl, Contract> {
  constructor() {
    super(createContractControls({}));
  }
}