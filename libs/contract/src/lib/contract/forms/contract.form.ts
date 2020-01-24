import { FormControl } from '@angular/forms';
import { Injectable } from '@angular/core';
import {
  createContract,
  createPartyDetails
} from '@blockframes/contract/contract/+state/contract.model';
import { Contract } from './../+state/contract.model';
import { ContractPartyForm } from './party-name/party-name.form';
import { ContractPartyDetail } from '../+state/contract.model';
import {
  createLegalDocument,
  createLegalDocuments
} from '@blockframes/contract/contract/+state/contract.model';
import {
  LegalDocument,
  LegalDocuments,
  ContractTitleDetail
} from '@blockframes/contract/contract/+state/contract.firestore';
import { urlValidators } from '@blockframes/utils/form/validators';
import { ContractVersion } from '@blockframes/contract/version/+state/contract-version.model';
import { FormStaticValue, FormList, FormEntity } from '@blockframes/utils/form';

function createContractControls(contract: Partial<Contract>) {
  const entity = createContract(contract);
  return {
    parties: FormList.factory(entity.parties, partyDetails => new PartyDetailsForm(partyDetails)),
    documents: new LegalDocumentsForm(entity.documents),
    titleIds: FormList.factory(contract.titleIds),
    versions: FormList.factory(contract.versions, version => new ContractVersionForm(version))
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
    status: new FormControl(entity.status)
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
    invoices: FormList.factory(entity.invoices, el => new LegalDocumentForm(el)),
    bill: new LegalDocumentForm(entity.bill)
  };
}

export type LegalDocumentsControl = ReturnType<typeof createLegalDocumentsControl>;

export class LegalDocumentsForm extends FormEntity<LegalDocumentsControl> {
  constructor(legalDocuments?: Partial<LegalDocuments>) {
    super(createLegalDocumentsControl(legalDocuments));
  }
}

function createContractVersionControls(contractVersion: Partial<ContractVersion> = {}) {
  return {
    titles: new ContractTitleDetailForm(contractVersion.titles)
  };
}

type ContractVersionControl = ReturnType<typeof createContractVersionControls>;

export class ContractVersionForm extends FormEntity<ContractVersionControl> {
  constructor(contractVersion: Partial<ContractVersion> = {}) {
    super(createContractVersionControls(contractVersion));
  }
}

// Contract Titles

function createContractTitlesControls(
  titles: Record<string, Partial<ContractTitleDetail>>
): ContractTitlesControl {
  const controls = {}
  const ids = Object.keys(titles);
  for(const id in titles) {
    controls[id] = new ContractTitleDetailForm(titles[id])
  }
  return controls;
}

type ContractTitlesControl = Record<string, ContractTitleDetailForm>;

export class ContractTitlesForm extends FormEntity<ContractTitlesControl> {
  constructor(titleDetail: Partial<ContractTitleDetail> = {}) {
    super(createContractTitlesControls(titleDetail));
  }
}

// Contract Title Details

function createContractTitleDetailControl(detail?: Partial<ContractTitleDetail>){
  const entity = createContractTitleDetail(detail)
  return {
    distributionDealIds: FormList.factory(entity.distributionDealIds)
  }
}

type ContractTitleDetailControl = ReturnType<typeof createContractTitleDetailControl>;

export class ContractTitleDetailForm extends FormEntity<ContractTitleDetailControl> {
  constructor(detail?: Partial<ContractTitleDetail>){
    super(createContractTitleDetailControl(detail))
  }
}