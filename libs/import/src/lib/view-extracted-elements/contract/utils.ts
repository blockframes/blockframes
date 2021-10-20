
import { AngularFirestore } from '@angular/fire/firestore';

import { centralOrgId } from '@env';
import { Media, Territory } from '@blockframes/utils/static-model';
import { OrganizationService } from '@blockframes/organization/+state';
import { createTerm } from '@blockframes/contract/term/+state/term.model';
import { TermService } from '@blockframes/contract/term/+state/term.service';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { ContractsImportState, SpreadsheetImportError } from '@blockframes/import/utils';
import { createMovieLanguageSpecification, MovieService } from '@blockframes/movie/+state';
import { createMandate, createSale } from '@blockframes/contract/contract/+state/contract.model';
import { extract, ExtractConfig, getStaticList, SheetTab, split, ValueWithWarning } from '@blockframes/utils/spreadsheet';


const separator = ';'

const errorCodes = [
  'no-title-id',
  'wrong-type',
  'sales-only',
  'no-internal',
  'no-seller-id',
  'wrong-seller',
  'empty-buyer',
  'no-buyer-id',
  'buyer-not-ac',
  'used-id',
  'no-parent',
  'no-territories',
  'no-medias',
  'no-duration-from',
  'no-duration-to',
] as const;
type ErrorCode = typeof errorCodes[number];

const errorMap: { [key in ErrorCode]: SpreadsheetImportError } = {
  'no-title-id': {
    type: 'error',
    field: 'contract.titleId',
    reason: `This title doesn't match any known title.`,
    name: 'Title not found',
    hint: 'Please check the international title.'
  },

  'wrong-type': {
    type: 'error',
    field: 'contract.type',
    reason: `Type should be either "mandate" or "sale"`,
    name: 'Wrong contract Type',
    hint: 'Please edit the corresponding sheet field.'
  },
  'sales-only': {
    type: 'error',
    field: 'contract.type',
    reason: `This contract is not a sale`,
    name: 'Unauthorized',
    hint: 'You are only allowed to import "sale" contracts, please edit the corresponding sheet field.'
  },

  'no-seller-id': {
    type: 'error',
    field: 'contract.sellerId',
    reason: `Couldn't find Licensor with the provided name.`,
    name: 'Unknown Licensor',
    hint: 'Edit corresponding sheet field.'
  },
  'no-internal': {
    type: 'error',
    field: 'contract.sellerId',
    reason: `The Licensor shouldn't be Archipel Content.`,
    name: 'This sale is not external',
    hint: 'Please only import external sales. Sales made within the Archipel platform will be added automatically.'
  },
  'wrong-seller': {
    type: 'error',
    field: 'contract.sellerId',
    reason: `The Licensor should be your own Organization.`,
    name: 'You are not the seller',
    hint: 'Please only import external sales made by your onw Organization. Please check the Licensor sheet field.'
  },

  'empty-buyer': {
    type: 'error',
    field: 'contract.buyerId',
    reason: `The Licensee name is mandatory.`,
    name: 'Empty Licensee',
    hint: 'Edit corresponding sheet field.'
  },
  'no-buyer-id': {
    type: 'error',
    field: 'contract.buyerId',
    reason: `Couldn't find Licensee with the provided name.`,
    name: 'Unknown Licensee',
    hint: 'Edit corresponding sheet field.'
  },
  'buyer-not-ac': {
    type: 'error',
    field: 'contract.buyerId',
    reason: `For a mandate the Licensee name should always be "Archipel Content".`,
    name: 'Licensee is not Archipel Content',
    hint: 'Edit corresponding sheet field.'
  },

  'used-id': {
    type: 'error',
    field: 'contract.id',
    reason: `This id is already used for a contract.`,
    name: 'Contract ID',
    hint: 'Please use another id. If you want to update the contract, do it through the app instead.',
  },

  'no-parent': {
    type: 'error',
    field: 'contract.parentTermId',
    reason: `Internal sales must reference a Parent Term.`,
    name: 'Mandate ID',
    hint: 'Please use an already existing Term ID or the number of a previous valid row.',
  },

  'no-territories': {
    type: 'error',
    field: 'term.territories',
    name: 'No Territories',
    reason: 'Archipel Content needs to know the territories in which the movie can be sold.',
    hint: 'Edit corresponding sheet field.'
  },
  'no-medias': {
    type: 'error',
    field: 'term.medias',
    name: 'No Medias',
    reason: 'Archipel Content needs to know the medias in which the movie can be sold.',
    hint: 'Edit corresponding sheet field.'
  },
  'no-duration-from': {
    type: 'error',
    field: 'term.duration.from',
    name: 'Duration Error (from)',
    reason: 'Archipel Content needs to know the starting date of the contract.',
    hint: 'Edit corresponding sheet field.'
  },
  'no-duration-to': {
    type: 'error',
    field: 'term.duration.to',
    name: 'Duration Error (to)',
    reason: 'Archipel Content needs to know the ending date of the contract.',
    hint: 'Edit corresponding sheet field.'
  }
};

const warningCodes = [
  'buyer-unknown'
] as const;
type WarningCode = typeof warningCodes[number];

const warningMap: { [key in WarningCode]: SpreadsheetImportError } = {
  'buyer-unknown': {
    type: 'warning',
    field: 'contract.buyerId',
    reason: `We don't know any Organization with this name.`,
    name: 'Unknown Licensee',
    hint: 'Please check the field. If the name is correct you can ignore this warning.'
  },
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
  /* e */'territories': (value: string) => getStaticList('territories', value, separator, errorMap['no-territories']) as Territory[],
  /* f */'medias': (value: string) => getStaticList('medias', value, separator, errorMap['no-medias']) as Media[],
  /* g */'exclusive': (value: string) => value.toLowerCase() === 'yes' ? true : false,
  /* h */'duration.from': (value: string) => getDate(value, errorMap['no-duration-from']) as Date,
  /* i */'duration.to': (value: string) => getDate(value, errorMap['no-duration-to']) as Date,
  /* j */'originalLanguageLicensed': (value: string) => value,
  /* k */'dubbed': (value: string) => getStaticList('languages', value, separator) as Territory[],
  /* l */'subtitle': (value: string) => getStaticList('languages', value, separator) as Territory[],
  /* m */'closedCaptioning': (value: string) => getStaticList('languages', value, separator) as Territory[],

  // ADMIN COLUMNS
  /* n */'contractId': (value: string) => value,
  /* o */'parentTermId': (value: string) => value,
  /* p */'titleId': (value: string) => value,
  /* q */'stakeholdersList': (value: string) => value ? split(value, separator) : [value],
} as const;


async function getOrgId(name: string, orgService: OrganizationService, cache: Record<string, string>) {
  if (!name) return '';
  if (name === 'Archipel Content') return centralOrgId.catalog;

  if (cache[name]) return cache[name];

  const orgs = await orgService.getValue(ref => ref.where('denomination.full', '==', name));
  const result = orgs.length === 1 ? orgs[0].id : '';
  cache[name] = result;
  return result;
}

async function getTitleId(name: string, titleService: MovieService, cache: Record<string, string>) {
  if (!name) return '';

  if (cache[name]) return cache[name];

  const titles = await titleService.getValue(ref => ref.where('title.international', '==', name));
  const result =  titles.length === 1 ? titles[0].id : '';
  cache[name] = result;
  return result;
}


export async function formatContract(
  sheetTab: SheetTab,
  termService: TermService,
  titleService: MovieService,
  orgService: OrganizationService,
  contractService: ContractService,
  userOrgId: string,
  blockframesAdmin: boolean,
  firestore: AngularFirestore,
) {

  // Cache to avoid  querying db every time
  const orgNameCache: Record<string, string> = {};
  const titleNameCache: Record<string, string> = {};

  const contractsToCreate: ContractsImportState[] = [];

  for (const rawRow of sheetTab.rows) {

    const row = rawRow.map(cell => typeof cell === "string" ? cell.trim() : cell.toString());

    if (!row.length) continue;

    const { data, errors } = extract<FieldsConfig>([row], fieldsConfig);

    const contract = data.type === 'sale' ? createSale() : createMandate();

    // TITLE
    contract.titleId = data.titleId || (await getTitleId(data.title.international, titleService, titleNameCache));
    if (!contract.titleId) errors.push(errorMap['no-title-id']);

    // TYPE
    if (data.type !== 'sale' && data.type !== 'mandate') {

      errors.push(errorMap['wrong-type']);

    //-------------------------
    //         MANDATE       //
    //-------------------------
    } else if (data.type === 'mandate') {

      if (!blockframesAdmin) errors.push(errorMap['sales-only']);

      // SELLER
      contract.sellerId = await getOrgId(data.licensorName, orgService, orgNameCache);
      if (!contract.sellerId) errors.push(errorMap['no-seller-id']);

      // BUYER
      contract.buyerId = centralOrgId.catalog;
      if (data.licenseeName !== 'Archipel Content') errors.push(errorMap['buyer-not-ac']);

      contract.stakeholders = [contract.buyerId, contract.sellerId];

      // OTHER STAKEHOLDERS
      data.stakeholdersList.forEach(id => contract.stakeholders.push(id));


    //-------------------------
    //          SALE         //
    //-------------------------
    } else if (data.type === 'sale') {

      // INTERNAL SALE
      if (data.licensorName === 'Archipel Content') {

        // only admin can import internal sales
        if (!blockframesAdmin) errors.push(errorMap['no-internal']);

        // SELLER
        contract.sellerId = centralOrgId.catalog;

        // BUYER
        contract.buyerId = await getOrgId(data.licenseeName, orgService, orgNameCache);
        if (!contract.buyerId) errors.push(errorMap['no-buyer-id']);

        contract.stakeholders = [contract.buyerId, contract.sellerId];

        // OTHER STAKEHOLDERS
        data.stakeholdersList.forEach(id => contract.stakeholders.push(id));

        // PARENT TERM ID
        const rawRef = data.parentTermId;

        if (!rawRef) errors.push(errorMap['no-parent']);

        else if (rawRef.length === 28) { // Term ID
          const parentTerm = await termService.getValue(rawRef);
          contract.parentTermId = parentTerm?.id;
          if (!contract.parentTermId) errors.push(errorMap['no-parent']);

        } else { // Row number
          const rowNum = parseInt(rawRef);
          const parentContract = contractsToCreate[rowNum - 2]; // excel start at 1 and the first line is the column names
          contract.parentTermId = parentContract?.contract?.termIds?.[0];
          if (!contract.parentTermId) errors.push(errorMap['no-parent']);
        }

      // EXTERNAL SALE
      } else {

        // SELLER
        if (blockframesAdmin) { // admin can import any external sales

          const sellerId = await getOrgId(data.licensorName, orgService, orgNameCache);
          if (!sellerId) errors.push(errorMap['no-seller-id']);
          contract.sellerId = sellerId;

        } else { // regular user can only import their own sales
          contract.sellerId = userOrgId;
          const userOrg = await orgService.getValue(userOrgId);
          if (userOrg.denomination.full !== data.licensorName) errors.push(errorMap['wrong-seller']);
        }

        // BUYER
        if (!data.licenseeName) errors.push(errorMap['empty-buyer']);
        else {
          const buyerId = await getOrgId(data.licenseeName, orgService, orgNameCache);
          if (!buyerId) errors.push(warningMap['buyer-unknown']);
        }

        // OTHER STAKEHOLDERS
        data.stakeholdersList.forEach(id => contract.stakeholders.push(id));
      }
    }

    // ADMIN CONTRACT ID
    // - force the contract ID
    // - ensure the contract doesn't exist (updates are forbidden)
    if (blockframesAdmin && data.contractId) {
      const exist = await contractService.getValue(data.contractId);
      if (exist) errors.push(errorMap['used-id']);
      contract.id = data.contractId;
    }

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
      newContract: true,
      errors,
      terms: [term]
    });
  }
  return contractsToCreate;
}
