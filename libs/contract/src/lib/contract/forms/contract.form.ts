import { FormList } from '@blockframes/utils';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { FormControl } from '@angular/forms';
import { Injectable } from '@angular/core';
import { createContract, createPartyDetails } from '@blockframes/contract/contract/+state/contract.model';
import { Contract } from './../+state/contract.model';
import { ContractPartyForm } from './party-name/party-name.form';
import { ContractPartyDetail } from '../+state/contract.model';
import { createLegalDocument, createLegalDocuments } from '@blockframes/contract/contract/+state/contract.model';
import { LegalDocument, LegalDocuments } from '@blockframes/contract/contract/+state/contract.firestore';;
import { urlValidators } from '@blockframes/utils/form/validators';


function createContractControls(contract: Partial<Contract>) {
  const entity = createContract(contract);
  return {
    parties: FormList.factory(entity.parties, partyDetails => new PartyDetailsForm(partyDetails)),
    documents: new LegalDocumentsForm(entity.documents)
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

// LEGAL DOCUMENTS


function createLegalDocumentControl(legalDocument?: Partial<LegalDocument>) {
  const { label, media, language, country } = createLegalDocument(legalDocument);
  return {
    label: new FormControl(label),
    media: new FormControl(media.url, urlValidators),
    language: new FormControl(language),
    country: new FormControl(country),
  }
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
    invoices: FormList.factory(entity.invoices, el => new LegalDocumentForm(el)),
    bill : new LegalDocumentForm(entity.bill)
  }
}

export type LegalDocumentsControl = ReturnType<typeof createLegalDocumentsControl>;

export class LegalDocumentsForm extends FormEntity<LegalDocumentsControl> {
  constructor(legalDocuments?: Partial<LegalDocuments>) {
    super(createLegalDocumentsControl(legalDocuments));
  }
}
