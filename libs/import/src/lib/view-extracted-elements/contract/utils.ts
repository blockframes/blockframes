
import { AngularFirestore } from '@angular/fire/firestore';

import {
  getDate,
  getOrgId,
  getTitleId,
  getContract,
  mandatoryError,
  checkParentTerm,
  wrongValueError,
  adminOnlyWarning,
  alreadyExistError,
  unknownEntityError,
  ContractsImportState,
  getUser,
  sheetHeaderLine,
  verifyIdExists,
} from '@blockframes/import/utils';
import { centralOrgId } from '@env';
import { MovieService } from '@blockframes/movie/+state';
import { getKeyIfExists } from '@blockframes/utils/helpers';
import { User, UserService } from '@blockframes/user/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { Term } from '@blockframes/contract/term/+state/term.firestore';
import { Language, Media, Territory } from '@blockframes/utils/static-model';
import { MovieLanguageSpecification } from '@blockframes/movie/+state/movie.firestore';
import { Mandate, Sale } from '@blockframes/contract/contract/+state/contract.firestore';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { createMandate, createSale } from '@blockframes/contract/contract/+state/contract.model';
import {
  extract, ExtractConfig,
  getStaticList, SheetTab, getGroupedList,
} from '@blockframes/utils/spreadsheet';

const separator = ';'

interface FieldsConfig {
  contract: {
    titleId: string;
    type: 'mandate' | 'sale';
    sellerId: string;
    buyerId: string;
    id?: string;
    stakeholders: string[];
    status: string,
  };
  income: {
    price: number;
  },
  term: {
    territories_included: Territory[];
    territories_excluded: Territory[];
    medias: Media[];
    exclusive: boolean;
    duration: {
      from: Date;
      to: Date;
    };
    licensedOriginal: boolean;
    dubbed: Language[];
    subtitle: Language[];
    caption: Language[];
  }[];
  parentTerm: string | number;
  _titleId?: string;
}

type FieldsConfigType = ExtractConfig<FieldsConfig>;


function toTerm(rawTerm: FieldsConfig['term'][number], contractId: string, firestore: AngularFirestore): Term {

  const { medias, duration, territories_excluded, territories_included, exclusive, licensedOriginal } = rawTerm;

  const languages: Term['languages'] = {};

  const updateLanguage = (key: keyof MovieLanguageSpecification, rawLanguages: Language[]) => {
    for (const language of rawLanguages) {
      if (!languages[language]) languages[language] = { caption: false, dubbed: false, subtitle: false };
      languages[language][key] = true;
    }
  }

  updateLanguage('caption', rawTerm.caption);
  updateLanguage('dubbed', rawTerm.dubbed);
  updateLanguage('subtitle', rawTerm.subtitle);

  const territories = territories_included.filter(territory => !territories_excluded.includes(territory));

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

async function verifyMovieBelongsToLicensor(contract: Sale<Date> | Mandate<Date>, titleService: MovieService) {
  const { titleId, sellerId } = contract;
  const title = await titleService.getValue(titleId);
  if (title.orgIds.includes(sellerId)) return true;
  return false;
}

export async function formatContract(
  sheetTab: SheetTab,
  orgService: OrganizationService,
  titleService: MovieService,
  contractService: ContractService,
  userService: UserService,
  firestore: AngularFirestore,
  blockframesAdmin: boolean,
  userOrgId: string,
) {

  // Cache to avoid  querying db every time
  const orgNameCache: Record<string, string> = {};
  const titleNameCache: Record<string, string> = {};
  const userCache: Record<string, User> = {};
  const contractCache: Record<string, (Mandate | Sale)> = {};

  const contracts: ContractsImportState[] = [];

  // ! The order of the property should be the same as excel columns
  const fieldsConfig: FieldsConfigType = {
    /* a */'contract.titleId': async (value: string) => {
      if (!value) return mandatoryError('Title');
      const titleId = await getTitleId(value, titleService, titleNameCache, userOrgId, blockframesAdmin);
      if (await verifyIdExists(value, titleService)) return value;
      if (!titleId) return unknownEntityError('Title');
      return titleId;
    },
    /* b */'contract.type': (value: string) => {
      const lower = value.toLowerCase();
      if (!lower) return mandatoryError('Type');
      const type = getKeyIfExists('contractType', lower[0].toUpperCase() + lower.substr(1));
      if (!type) return wrongValueError('Type');
      if (type === 'mandate' && !blockframesAdmin) return {
        value: undefined,
        error: {
          type: 'error',
          name: `Forbidden Type`,
          reason: 'Only admin can import mandates.',
          hint: 'Please ensure the corresponding sheet field value is "sale".'
        }
      };
      return lower.toLowerCase() as 'mandate' | 'sale';
    },
    /* c */'contract.sellerId': async (value: string) => {
      if (!value) return mandatoryError('Licensor');
      if (value === 'Archipel Content' || value === centralOrgId.catalog) {
        if (!blockframesAdmin) return {
          value: undefined,
          error: {
            type: 'error',
            name: `Forbidden Licensor`,
            reason: 'Internal sales don\'t need to be imported and will appear automatically on your dashboard.',
            hint: 'Please ensure that the Licensor name is not "Archipel Content". Only admin can import internal sales.'
          }
        };
        return centralOrgId.catalog;
      } else {
        let sellerId = await getOrgId(value, orgService, orgNameCache);
        if (!sellerId) {
          if (await verifyIdExists(value, orgService)) sellerId = value;
          else return unknownEntityError('Licensor Organization');
        }
        if (!blockframesAdmin && sellerId !== userOrgId) return {
          value: undefined,
          error: {
            type: 'error',
            name: 'Forbidden Licensor',
            reason: 'You should be the seller of this contract. The Licensor name should be your organization name.',
            hint: 'Please edit the corresponding sheet field'
          }
        };
        return sellerId;
      }
    },
    /* d */'contract.buyerId': async (value: string, data: FieldsConfig) => {
      if (data.contract.type === 'mandate') {
        if (!value) return mandatoryError('Licensee');
        if (value !== 'Archipel Content' && value !== centralOrgId.catalog) return {
          value: undefined,
          error: {
            type: 'error',
            name: 'Forbidden Licensee',
            reason: 'The Licensee name of a mandate must be "Archipel Content".',
            hint: 'Please edit the corresponding sheet field'
          }
        };
        return centralOrgId.catalog;
      } else {
        if (!value) return '';
        const isInternal = data.contract.sellerId === centralOrgId.catalog;
        let buyerId = await getOrgId(value, orgService, orgNameCache);
        if (!buyerId && await verifyIdExists(value, titleService)) buyerId = value;
        if (isInternal && !buyerId) return unknownEntityError('Licensee Organization');
        return buyerId;
      }
    },
    /* e */'term[].territories_included': (value: string) => getGroupedList(value, 'territories', separator) as Territory[],
    /* f */'term[].territories_excluded': (value: string) => getGroupedList(value, 'territories', separator) as Territory[],
    /* g */'term[].medias': (value: string) => getGroupedList(value, 'medias', separator) as Media[],
    /* h */'term[].exclusive': (value: string) => {
      const lower = value.toLowerCase();
      if (!lower) return mandatoryError('Exclusive');
      if (lower !== 'yes' && lower !== 'no') return wrongValueError('Exclusive');
      return lower === 'yes';
    },
    /* i */'term[].duration.from': (value: string) => {
      if (!value) return mandatoryError('Duration From');
      return getDate(value, 'Start of Contract') as Date
    },
    /* j */'term[].duration.to': (value: string) => {
      if (!value) return mandatoryError('Duration To');
      return getDate(value, 'End of Contract') as Date
    },

    /* k */'term[].licensedOriginal': (value: string) => {
      const lower = value.toLowerCase();
      if (!lower) return mandatoryError('Licensed Original');
      if (lower !== 'yes' && lower !== 'no') return wrongValueError('Licensed Original');
      return lower === 'yes';
    },
    /* l */'contract.status': (value: string = 'pending') => value.toLowerCase(),
    /* m */'term[].dubbed': (value: string) => getStaticList('languages', value, separator, 'Dubbed', false) as Language[],
    /* n */'term[].subtitle': (value: string) => getStaticList('languages', value, separator, 'Subtitle', false) as Language[],
    /* o */'term[].caption': (value: string) => getStaticList('languages', value, separator, 'CC', false) as Language[],

    /* p */'contract.id': async (value: string) => {
      if (value && !blockframesAdmin) return adminOnlyWarning(firestore.createId(), 'Contract ID');
      if (!value) return firestore.createId();
      const exist = await getContract(value, contractService, contractCache);
      if (exist) return alreadyExistError('Contract ID');
      return value;
    },
    /* q */'parentTerm': async (value: string, data: FieldsConfig) => {
      if (value && !blockframesAdmin) return adminOnlyWarning('', 'Mandate ID/Row');
      if (value && data.contract.type === 'mandate') return {
        value: '',
        error: {
          type: 'warning',
          field: 'parentTerm',
          name: 'Unused Mandate ID/Row',
          reason: 'Mandate ID is used only for sales contracts, here the value will be omitted because the contract is a mandate.',
          hint: 'Remove the corresponding sheet field to silence this warning.'
        }
      };
      if (!value && data.contract.type === 'sale' && data.contract.sellerId === centralOrgId.catalog) {
        return mandatoryError('Mandate ID/Row');
      }
      if (value && data.contract.type === 'sale' && data.contract.sellerId !== centralOrgId.catalog) {
        return {
          value: '',
          error: {
            type: 'warning',
            field: 'parentTerm',
            name: 'Unused Mandate ID/Row',
            reason: 'Mandate ID is used only for internal sales, here the value will be omitted because the sale is external.',
            hint: 'Remove the corresponding sheet field to silence this warning.'
          }
        };
      }
      const isId = isNaN(Number(value));
      if (isId) {
        const exist = await checkParentTerm(value, contractService, contractCache);
        if (!exist) return unknownEntityError('Mandate ID');
        return value;
      } else return Number(value);
    },
    /* r */'contract.stakeholders': async (value: string, data: FieldsConfig) => {
      const stakeholders = value.split(separator).filter(v => !!v).map(v => v.trim());
      const exists = await Promise.all(stakeholders.map(id => getUser({ id }, userService, userCache)));
      const unknownStakeholder = exists.some(e => !e);
      if (unknownStakeholder) return unknownEntityError('Stakeholders');
      if (data.contract.type === 'mandate') {
        return [data.contract.buyerId, data.contract.sellerId, ...stakeholders];
      } else {
        if (data.contract.sellerId === centralOrgId.catalog) { // internal sale
          // seller ID is archipel, we don't need to add it, as mandate stakeholders will be copied here (copy is done bellow ~line 290)
          return [data.contract.buyerId, ...stakeholders];
        } else { // external sale
          // if the sale is external the seller is not archipel (it's the owner org), and the buyer is unknown by definition
          return [data.contract.sellerId, ...stakeholders]
        }
      }
    },
  };

  const results = await extract<FieldsConfig>(sheetTab.rows, fieldsConfig, 11);
  for (const result of results) {
    const { data, errors } = result;

    const contract = data.contract.type === 'sale'
      ? createSale({ ...data.contract as Sale })
      : createMandate({ ...data.contract as Mandate });

    const movieBelongsToLicensor = await verifyMovieBelongsToLicensor(contract, titleService);
    if (!movieBelongsToLicensor)
      errors.push({
        type: 'error',
        name: 'Wrong Licensor.',
        reason: `The movie does not belong to the licensor.`,
        hint: `Please ensure the movie is a movie owned by the licensor.`
      });

    const terms = data.term.map(term => toTerm(term, contract.id, firestore));

    // for **internal** sales we should check the parentTerm
    const isInternalSale = contract.type === 'sale' && contract.sellerId === centralOrgId.catalog;
    if (isInternalSale) {
      if (typeof data.parentTerm === 'number') {
        const mandate = contracts[data.parentTerm - sheetHeaderLine.contracts - 1]; // first line is the column names
        contract.parentTermId = mandate?.terms[0]?.id;
        if (!mandate || !contract.parentTermId) errors.push({
          type: 'error',
          name: 'Wrong Mandate Row',
          reason: 'Mandate Row point to a wrong sheet line.',
          hint: 'Please check that the line number is correct and that the line is a mandate.'
        });
        contract.stakeholders.concat(mandate.contract.stakeholders);
      } else {
        // here we are sure that the term exist because we already tested it above (~line 210, column o: contract.parentTerm)
        contract.parentTermId = data.parentTerm;
        // moreover the corresponding mandate is already in the contractCache so the look up should be efficient
        const mandate = await checkParentTerm(contract.parentTermId, contractService, contractCache);
        contract.stakeholders.concat(mandate.stakeholders);
      }
    }

    // remove duplicate from stakeholders
    contract.stakeholders = Array.from(new Set([...contract.stakeholders]));

    contracts.push({ contract, terms, errors, newContract: true });
  }
  console.log({ contracts })
  return contracts;
}
