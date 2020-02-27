import { FormControl } from '@angular/forms';
import { urlValidators } from '@blockframes/utils/form/validators';
import { FormStaticValue, FormList, FormEntity } from '@blockframes/utils/form';
import {
  createContract,
  createContractPartyDetail,
  Contract,
  ContractPartyDetail,
  createLegalDocument,
  createContractLegalDocuments,
  LegalDocument,
  ContractLegalDocuments,
} from '../+state';
import { ContractPartyForm } from './party/party.form';
import { ContractVersionForm } from '@blockframes/contract/version/form/version.form';
import { createParty } from '@blockframes/utils/common-interfaces';

// PARTY DETAILS

function createPartyDetailsControls(partyDetails: Partial<ContractPartyDetail> = {}) {
  const entity = createContractPartyDetail(partyDetails);
  return {
    party: new ContractPartyForm(entity.party),
    status: new FormControl(entity.status),
    childRoles: new FormControl(entity.childRoles)
  };
}

type PartyDetailsControl = ReturnType<typeof createPartyDetailsControls>;

export class PartyDetailsForm extends FormEntity<PartyDetailsControl, ContractPartyDetail> {
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

export class LegalDocumentForm extends FormEntity<LegalDocumentControl, LegalDocument> {
  constructor(legalDocument?: Partial<LegalDocument>) {
    super(createLegalDocumentControl(legalDocument));
  }
}

function createLegalDocumentsControl(legalDocuments?: Partial<ContractLegalDocuments>) {
  const entity = createContractLegalDocuments(legalDocuments);
  return {
    expenses: FormList.factory(entity.expenses, el => new LegalDocumentForm(el)),
    invoices: FormList.factory(entity.invoices, el => new LegalDocumentForm(el))
  };
}

export type LegalDocumentsControl = ReturnType<typeof createLegalDocumentsControl>;

export class LegalDocumentsForm extends FormEntity<LegalDocumentsControl, ContractLegalDocuments> {
  constructor(legalDocuments?: Partial<ContractLegalDocuments>) {
    super(createLegalDocumentsControl(legalDocuments));
  }
}

// CONTRACT


function createContractControls(contract: Partial<Contract> = {}) {
  const entity = createContract(contract);

  // If there is no party, set a licensee & a licensor by default
  if (!entity.parties.length) {
    entity.parties = [
      createContractPartyDetail({ party: createParty({ role: 'licensee' }) }),
      createContractPartyDetail({ party: createParty({ role: 'licensor' }) })
    ]
  }

  // @todo(#1887)
  const versions = entity.versions.filter(({ id }) => id !== '_meta');
  return {
    id: new FormControl(contract.id),
    parties: FormList.factory(entity.parties, partyDetails => new PartyDetailsForm(partyDetails)),
    documents: new LegalDocumentsForm(entity.documents),
    titleIds: FormList.factory(contract.titleIds),
    versions: FormList.factory(versions, version => new ContractVersionForm(version))
  };
}

type ContractControl = ReturnType<typeof createContractControls>;

export class ContractForm extends FormEntity<ContractControl, Contract> {
  constructor(contract?: Partial<Contract>) {
    super(createContractControls(contract));
  }
}