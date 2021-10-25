
import { Language, Media, Territory } from '@blockframes/utils/static-model';
import { OrganizationService } from '@blockframes/organization/+state';
import { Term } from '@blockframes/contract/term/+state/term.firestore';
import { createTerm } from '@blockframes/contract/term/+state/term.model';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { Mandate, Sale } from '@blockframes/contract/contract/+state/contract.firestore';
import { ContractsImportState, SpreadsheetImportError } from '@blockframes/import/utils';
import { createMovieLanguageSpecification, MovieService } from '@blockframes/movie/+state';
import { createMandate, createSale, isSale } from '@blockframes/contract/contract/+state/contract.model';
import { extract, ExtractConfig, getStaticList, SheetTab, split, ValueWithWarning } from '@blockframes/utils/spreadsheet';

import { centralOrgId } from '@env';
import { AngularFirestore } from '@angular/fire/firestore';
import { MovieLanguageSpecification } from '@blockframes/movie/+state/movie.firestore';

const separator = ';'
const errorCodes = [
  'no-title-id',
  'sales-only',
  'no-seller-id',
  'wrong-contract-id',
  'no-buyer-id',
  'no-stakeholders',
  'no-territories',
  'no-medias',
  'no-duration-from',
  'no-duration-to',
] as const;
type ErrorCode = typeof errorCodes[number];

const errorsMap: { [key in ErrorCode]: SpreadsheetImportError } = {
  'no-title-id': {
    type: 'error',
    field: 'contract.titleId',
    reason: `No title found`,
    name: 'no-title-id',
    hint: 'Please check the international title or enter the ID of the title'
  },
  'sales-only': {
    type: 'error',
    field: 'contract.type',
    reason: `This contract is not a sale`,
    name: 'sales-only',
    hint: 'You are only allowed to import "sale" contracts, please edit the corresponding sheet field.'
  },
  'no-seller-id': {
    type: 'error',
    field: 'contract.sellerId',
    reason: `Couldn't find Licensor with the provided name.`,
    name: 'Seller ID',
    hint: 'Edit corresponding sheet field.'
  },
  'no-buyer-id': {
    type: 'warning',
    field: 'contract.buyerId',
    reason: `Couldn't find Licensee with the provided name.`,
    name: 'Buyer ID',
    hint: 'Edit corresponding sheet field.'
  },
  'wrong-contract-id': {
    type: 'warning',
    field: 'contract.contractId',
    reason: `Couldn't find contract with provided Id`,
    name: 'Contract Id',
    hint: 'Edit corresponding sheet field.'
  },
  'no-stakeholders': {
    type: 'warning', // TODO issue#6900 maybe this should be an error instead of a warning
    field: 'contract.stakeholders',
    name: 'Stakeholders',
    reason: 'If this mandate has stakeholders, please fill in the name',
    hint: 'Edit corresponding sheet field.'
  },
  'no-territories': {
    type: 'error',
    field: 'term.territories',
    name: 'Territory',
    reason: 'Archipel Content needs to know the territories in which the movie can be sold.',
    hint: 'Edit corresponding sheet field.'
  },
  'no-medias': {
    type: 'error',
    field: 'term.medias',
    name: 'Media',
    reason: 'Archipel Content needs to know the medias in which the movie can be sold.',
    hint: 'Edit corresponding sheet field.'
  },
  'no-duration-from': {
    type: 'error',
    field: 'term.duration.from',
    name: 'Duration from',
    reason: 'Archipel Content needs to know the starting date of the contract.',
    hint: 'Edit corresponding sheet field.'
  },
  'no-duration-to': {
    type: 'error',
    field: 'term.duration.to',
    name: 'Duration to',
    reason: 'Archipel Content needs to know the ending date of the contract.',
    hint: 'Edit corresponding sheet field.'
  }
}

// Time is MM/DD/YYYY
function convertDate(time: string) {
  if (isNaN(+time)) {
    const [month, day, year] = time.split(/[/.]+/).map(t => parseInt(t, 10));
    return new Date(year, month - 1, day, 0, 0, 0);
  } else {
    return new Date(Math.round(+time - 25569) * 86400 * 1000);
  }
}

function getDate(value: string, error: SpreadsheetImportError) {
  const date = convertDate(value);
  if (isNaN(date.getTime()))
    return new ValueWithWarning(value, error);
  return date;
}

interface FieldsConfig {
  contract: {
    titleId: string;
    type: 'mandate' | 'sale';
    sellerId: string;
    buyerId: string;
    id?: string;
    stakeholders: string[];
  };
  term: {
    territories: Territory[];
    medias: Media[];
    exclusive: boolean;
    duration: {
      from: Date;
      to: Date;
    };
    licensedOriginal: boolean;
    dubbed: Language[];
    subtitle: Language[];
    closedCaptioning: Language[];
  };
  parentTerm: string | number;
  _titleId?: string;
}

type FieldsConfigType = ExtractConfig<FieldsConfig>;

async function getOrgId(name: string, orgService: OrganizationService, cache: Record<string, string>) {
  if (!name) return '';
  // @TODO #6586 careful if you are on an anonymized db, centralOrgId.catalog org name will not be 'Archipel Content'
  if (name === 'Archipel Content') return centralOrgId.catalog;

  if (cache[name]) return cache[name];

  const orgs = await orgService.getValue(ref => ref.where('denomination.full', '==', name));
  const result = orgs.length === 1 ? orgs[0].id : '';
  cache[name] = result;
  return result;
}

async function getTitleId(name: string, titleService: MovieService, cache: Record<string, string>, userOrgId: string, blockframesAdmin: boolean) {
  if (!name) return '';
  if (cache[name]) return cache[name];

  const titles = await titleService.getValue(ref => {
    if (blockframesAdmin) {
      return ref.where('title.international', '==', name);
    } else {
      return ref.where('title.international', '==', name)
        .where('orgIds', 'array-contains', userOrgId);
    }
  });
  const result =  titles.length === 1 ? titles[0].id : '';
  cache[name] = result;
  return result;
}

async function getContract(id: string, contractService: ContractService, cache: Record<string, (Mandate | Sale)>) {
  if (!id) return;

  if (cache[id]) return cache[id];

  const contract = await contractService.getValue(id);
  cache[id] = contract;
  return contract;
}


function toTerm(rawTerm: FieldsConfig['term'], contractId: string, firestore: AngularFirestore): Term {

  const { medias, duration, territories, exclusive, licensedOriginal } = rawTerm;

  const languages: Term['languages'] = {};

  const updateLanguage = (key: keyof MovieLanguageSpecification, rawLanguages: Language[]) => {
    for (const language of rawLanguages) {
      if (!languages[language]) languages[language] = { caption: false, dubbed: false, subtitle: false };
      languages[language][key] = true;
    }
  }

  // TODO ASK BUSINESS WTF IS CLOSED CAPTIONING
  // TODO language only support `caption` but term in db have an unknown extra `closedCaptioning` parameter
  // TODO maybe it refer to the same thing but with two different name ????
  updateLanguage('caption', rawTerm.closedCaptioning);
  updateLanguage('dubbed', rawTerm.dubbed);
  updateLanguage('subtitle', rawTerm.subtitle);

  const id = firestore.createId();

  return {
    id,
    languages,
    contractId,
    medias,
    duration,
    territories,
    exclusive,
    licensedOriginal,
    criteria: [],
  };
}

export async function formatContract(
  sheetTab: SheetTab,
  orgService: OrganizationService,
  titleService: MovieService,
  contractService: ContractService,
  firestore: AngularFirestore,
  blockframesAdmin: boolean,
  userOrgId: string,
) {

  // Cache to avoid  querying db every time
  const orgNameCache: Record<string, string> = {};
  const titleNameCache: Record<string, string> = {};
  const contractCache: Record<string, (Mandate | Sale)> = {};

  const contracts: ContractsImportState[] = [];

  const fieldsConfig: FieldsConfigType = {
    /* a */'contract.titleId': async (value: string) => {
      // TODO issue#6929
      // const titleId = await getTitleId(value, titleService, titleNameCache, userOrgId, blockframesAdmin);
      // throw errorsMap['no-title-id'];
      return value;
    },
    /* b */'contract.type': (value: string) => value.toLowerCase() as 'mandate' | 'sale',
    /* c */'contract.sellerId': (value: string) => value,
    /* d */'contract.buyerId': (value: string) => value,
    /* e */'term.territories': (value: string) => getStaticList('territories', value, separator, errorsMap['no-territories']) as Territory[],
    /* f */'term.medias': (value: string) => getStaticList('medias', value, separator, errorsMap['no-medias']) as Media[],
    /* g */'term.exclusive': (value: string) => value.toLowerCase() === 'yes',
    /* h */'term.duration.from': (value: string) => getDate(value, errorsMap['no-duration-from']) as Date,
    /* i */'term.duration.to': (value: string) => getDate(value, errorsMap['no-duration-to']) as Date,

    /* j */'term.licensedOriginal': (value: string) => value.toLowerCase() === 'yes', // ? Is this caption ??
    /* k */'term.dubbed': (value: string) => getStaticList('languages', value, separator) as Language[],
    /* l */'term.subtitle': (value: string) => getStaticList('languages', value, separator) as Language[],
    /* m */'term.closedCaptioning': (value: string) => getStaticList('languages', value, separator) as Language[],

    /* n */'contract.id': (value: string) => value,
    /* o */'parentTerm': (value: string) => value,
    /* p */'_titleId': (value: string) => value,
    /* q */'contract.stakeholders': (value: string) => value ? split(value, separator) : [value],
  };

  const results = await extract<FieldsConfig>(sheetTab.rows, fieldsConfig);


  for (const result of results) {
    const { data, errors, warnings } = result;

    const contract =  data.contract.type === 'sale'
      ? createSale({ ...data.contract as Sale})
      : createMandate({ ...data.contract as Mandate });

    const term = toTerm(data.term, contract.id, firestore);

    if (typeof data.parentTerm === 'number') {
      contract.parentTermId = contracts[data.parentTerm - 2]?.terms[0]?.id; // excel lines start at 1 and first line is the column names
      if (!contract.parentTermId) errors.push(errorsMap['TODO']) // TODO issue#6929
    }

    contracts.push({ contract, terms: [term], errors: [ ...errors, ...warnings ], newContract: true });
  }

  return contracts;
}
