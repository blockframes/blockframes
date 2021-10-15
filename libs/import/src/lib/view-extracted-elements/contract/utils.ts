
import { Media, Territory } from '@blockframes/utils/static-model';
import { OrganizationService } from '@blockframes/organization/+state';
import { createTerm } from '@blockframes/contract/term/+state/term.model';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { Mandate, Sale } from '@blockframes/contract/contract/+state/contract.firestore';
import { ContractsImportState, SpreadsheetImportError } from '@blockframes/import/utils';
import { createMovieLanguageSpecification, MovieService } from '@blockframes/movie/+state';
import { createMandate, createSale } from '@blockframes/contract/contract/+state/contract.model';
import { extract, ExtractConfig, getStaticList, SheetTab, split, ValueWithWarning } from '@blockframes/utils/spreadsheet';

import { centralOrgId } from '@env';
import { AngularFirestore } from '@angular/fire/firestore';

const separator = ';'
type errorCodes = 'no-title-id' | 'no-seller-id' | 'wrong-contract-id' | 'no-buyer-id' | 'no-stakeholders' | 'no-territories' | 'no-medias' | 'no-duration-from' | 'no-duration-to';

const errorsMap: { [key in errorCodes]: SpreadsheetImportError } = {
  'no-title-id': {
    type: 'warning',
    field: 'contract.titleId',
    reason: `No title found`,
    name: 'no-title-id',
    hint: 'Please check the international title or enter the ID of the title'
  },
  'no-seller-id': {
    type: 'warning',
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
    type: 'warning',
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
    type: 'warning',
    field: 'term.duration.from',
    name: 'Duration from',
    reason: 'Archipel Content needs to know the starting date of the contract.',
    hint: 'Edit corresponding sheet field.'
  },
  'no-duration-to': {
    type: 'warning',
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
  title: {
    international: string;
  };
  type: 'mandate' | 'sale';
  licensorName: string;
  licenseeName: string;
  territories: Territory[];
  medias: Media[];
  exclusive: boolean;
  duration: {
    from: Date;
    to: Date;
  };
  originalLanguageLicensed: string;
  dubbed: Territory[];
  subtitle: Territory[];
  closedCaptioning: Territory[];
  contractId: string;
  parentTermId: string;
  titleId?: string;
  stakeholdersList: string[];
}

type FieldsConfigType = ExtractConfig<FieldsConfig>;


const fieldsConfig: FieldsConfigType = {
  /* a */'title.international': (value: string) => value,
  /* b */'type': (value: string) => value.toLowerCase() as 'mandate' | 'sale',
  /* c */'licensorName': (value: string) => value,
  /* d */'licenseeName': (value: string) => value,
  /* e */'territories': (value: string) => getStaticList('territories', value, separator, errorsMap['no-territories']) as Territory[],
  /* f */'medias': (value: string) => getStaticList('medias', value, separator, errorsMap['no-medias']) as Media[],
  /* g */'exclusive': (value: string) => value.toLowerCase() === 'yes' ? true : false,
  /* h */'duration.from': (value: string) => getDate(value, errorsMap['no-duration-from']) as Date,
  /* i */'duration.to': (value: string) => getDate(value, errorsMap['no-duration-to']) as Date,
  /* j */'originalLanguageLicensed': (value: string) => value,
  /* k */'dubbed': (value: string) => getStaticList('languages', value, separator) as Territory[],
  /* l */'subtitle': (value: string) => getStaticList('languages', value, separator) as Territory[],
  /* m */'closedCaptioning': (value: string) => getStaticList('languages', value, separator) as Territory[],
  /* n */'contractId': (value: string) => value,
  /* o */'parentTermId': (value: string) => value,
  /* p */'titleId': (value: string) => value,
  /* q */'stakeholdersList': (value: string) => value ? split(value, separator) : [value],
} as const;


async function getOrgId(name: string, orgService: OrganizationService) {
  if (!name) return '';
  // @TODO #6586 careful if you are on an anonymized db, centralOrgId.catalog org name will not be 'Archipel Content'
  if (name === 'Archipel Content') return centralOrgId.catalog;
  const orgs = await orgService.getValue(ref => ref.where('denomination.full', '==', name));
  return orgs.length === 1 ? orgs[0].id : '';
}

async function getTitleId(name: string, titleService: MovieService) {
  if (!name) return '';
  const titles = await titleService.getValue(ref => ref.where('title.international', '==', name));
  return titles.length === 1 ? titles[0].id : '';
}

export async function formatContract(
  sheetTab: SheetTab,
  orgService: OrganizationService,
  titleService: MovieService,
  contractService: ContractService,
  firestore: AngularFirestore,
) {

  const contractsToCreate: ContractsImportState[] = [];

  for (const rawRow of sheetTab.rows) {
    const row = rawRow.map(cell => typeof cell === "string" ? cell.trim() : cell.toString());
    if (!row.length) continue;

    const { data, warnings: errors, } = extract<FieldsConfig>([row], fieldsConfig)

    //////////////
    // CONTRACT //
    //////////////

    // TITLE
    const titleId = data.titleId || (await getTitleId(data.title.international, titleService));

    if (!titleId) errors.push(errorsMap['no-title-id']);

    // BUYER / SELLER
    const [sellerId, buyerId] = await Promise.all([
      getOrgId(data.licensorName, orgService),
      getOrgId(data.licenseeName, orgService),
    ])
    if (!sellerId) errors.push(errorsMap['no-seller-id']);
    if (!buyerId) errors.push(errorsMap['no-buyer-id']);

    // STAKEHOLDER
    const getStakeholders = Array.isArray(data.stakeholdersList) ? data.stakeholdersList.map(orgName => getOrgId(orgName, orgService)) : [];
    const stakeholders: string[] = (await Promise.all(getStakeholders)).filter(s => !!s);
    if (!stakeholders.length) errors.push(errorsMap['no-stakeholders']);

    // PARENT TERM ID
    // TODO add parentTermId to the sales & mandates

    // CONTRACT
    let baseContract: Partial<Mandate | Sale> = {};
    if (data.contractId) {
      baseContract = await contractService.getValue(data.contractId as string);
      if (!baseContract) errors.push(errorsMap['wrong-contract-id']);
    } else {
      baseContract.id = firestore.createId();
    }
    const contract = data.type === 'mandate'
      ? createMandate({ ...baseContract as Mandate, titleId, buyerId, sellerId, stakeholders, status: 'accepted' })
      : createSale({ ...baseContract as Sale, titleId, buyerId, sellerId, stakeholders, status: 'accepted' });


    ///////////
    // TERMS //
    ///////////
    const contractId = contract.id;

    const termId = firestore.createId();
    const term = createTerm({ id: termId, contractId, duration: data.duration, territories: data.territories, medias: data.medias, exclusive: data.exclusive });

    // Languages
    for (const [key, languages] of Object.entries({ dubbed: data.dubbed, subtitle: data.subtitle, closedCaptioning: data.closedCaptioning })) {
      for (const language of languages) {
        if (!term.languages[language]) term.languages[language] = createMovieLanguageSpecification();
        term.languages[language][key] = true;
      }
    }

    contract.termIds.push(termId);

    contractsToCreate.push({
      contract,
      newContract: !data.contractId,
      errors,
      terms: [term]
    });
  }
  return contractsToCreate;
}
