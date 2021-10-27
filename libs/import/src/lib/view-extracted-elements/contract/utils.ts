
import { AngularFirestore } from '@angular/fire/firestore';

import {
  getDate,
  getOrgId,
  userExist,
  getTitleId,
  getContract,
  MandatoryError,
  checkParentTerm,
  WrongValueError,
  adminOnlyWarning,
  AlreadyExistError,
  UnknownEntityError,
  ContractsImportState,
} from '@blockframes/import/utils';
import { centralOrgId } from '@env';
import { UserService } from '@blockframes/user/+state';
import { MovieService } from '@blockframes/movie/+state';
import { getKeyIfExists } from '@blockframes/utils/helpers';
import { OrganizationService } from '@blockframes/organization/+state';
import { Term } from '@blockframes/contract/term/+state/term.firestore';
import { Language, Media, Territory } from '@blockframes/utils/static-model';
import { MovieLanguageSpecification } from '@blockframes/movie/+state/movie.firestore';
import { Mandate, Sale } from '@blockframes/contract/contract/+state/contract.firestore';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { createMandate, createSale } from '@blockframes/contract/contract/+state/contract.model';
import { extract, ExtractConfig, getStaticList, SheetTab, ValueWithWarning } from '@blockframes/utils/spreadsheet';

const separator = ';'

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
    caption: Language[];
  };
  parentTerm: string | number;
  _titleId?: string;
}

type FieldsConfigType = ExtractConfig<FieldsConfig>;


function toTerm(rawTerm: FieldsConfig['term'], contractId: string, firestore: AngularFirestore): Term {

  const { medias, duration, territories, exclusive, licensedOriginal } = rawTerm;

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
  userService: UserService,
  firestore: AngularFirestore,
  blockframesAdmin: boolean,
  userOrgId: string,
) {

  // Cache to avoid  querying db every time
  const orgNameCache: Record<string, string> = {};
  const titleNameCache: Record<string, string> = {};
  const existingUserCache: Record<string, boolean> = {};
  const existingTermCache: Record<string, boolean> = {};
  const contractCache: Record<string, (Mandate | Sale)> = {};

  const contracts: ContractsImportState[] = [];

  // ! The order of the property should be the same as excel columns
  const fieldsConfig: FieldsConfigType = {
    /* a */'contract.titleId': async (value: string) => {
      const trimmed = value.trim();
      if (!value) throw new MandatoryError({ field: 'contract.titleId', name: 'Title' });
      const titleId = await getTitleId(trimmed, titleService, titleNameCache, userOrgId, blockframesAdmin);
      if (!titleId) throw new UnknownEntityError({ field: 'contract.titleId', name: 'Title' });
      return titleId;
    },
    /* b */'contract.type': (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) throw new MandatoryError({ field: 'contract.type', name: 'Type' });
      const type = getKeyIfExists('contractType', value);
      if (!type) throw new WrongValueError({ field: 'contract.type', name: 'Type' });
      if (type === 'mandate' && !blockframesAdmin) throw new Error(JSON.stringify({
        type: 'error',
        field: 'contract.type',
        name: `Forbidden Type`,
        reason: 'Only admin can import mandates.',
        hint: 'Please ensure the corresponding sheet field value is "sale".'
      }));
      return trimmed.toLowerCase() as 'mandate' | 'sale';
    },
    /* c */'contract.sellerId': async (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) throw new MandatoryError({ field: 'contract.sellerId', name: 'Licensor' });
      if (trimmed === 'Archipel Content') {
        if (!blockframesAdmin) throw new Error(JSON.stringify({
          type: 'error',
          field: 'contract.sellerId',
          name: `Forbidden Licensor`,
          reason: 'Internal sales don\'t need to be imported and will appear automatically on your dashboard.',
          hint: 'Please ensure that the Licensor name is not "Archipel Content". Only admin can import internal sales.'
        }));
        return centralOrgId.catalog;
      } else {
        const sellerId = await getOrgId(trimmed, orgService, orgNameCache);
        if (!sellerId) throw new UnknownEntityError({ field: 'contract.sellerId', name: 'Licensor Organization' });
        if (!blockframesAdmin && sellerId !== userOrgId) throw new Error(JSON.stringify({
          type: 'error',
          field: 'contract.sellerId',
          name: 'Forbidden Licensor',
          reason: 'You should be the seller of this contract. The Licensor name should be your own organization name.',
          hint: 'Please edit the corresponding sheet field'
        }));
        return sellerId;
      }
    },
    /* d */'contract.buyerId': async (value: string, data: FieldsConfig) => {
      const trimmed = value.trim();
      if (!trimmed) throw new MandatoryError({ field: 'contract.buyer', name: 'Licensee' });
      if (data.contract.type === 'mandate') {
        if (trimmed !== 'Archipel Content') throw new Error(JSON.stringify({
          type: 'error',
          field: 'contract.buyerId',
          name: 'Forbidden Licensee',
          reason: 'The Licensee name of a mandate must be "Archipel Content".',
          hint: 'Please edit the corresponding sheet field'
        }));
        return centralOrgId.catalog;
      } else {
        const isInternal = data.contract.sellerId === centralOrgId.catalog;
        const sellerId = await getOrgId(trimmed, orgService, orgNameCache);
        if (isInternal && !sellerId) throw new UnknownEntityError({ field: 'contract.buyerId', name: 'Licensee Organization' });
        return sellerId;
      }
    },
    /* e */'term.territories': (value: string) => getStaticList('territories', value, separator, { field: 'term.territories', name: 'Territories' }) as Territory[],
    /* f */'term.medias': (value: string) => getStaticList('medias', value, separator, { field: 'term.medias', name: 'Medias' }) as Media[],
    /* g */'term.exclusive': (value: string) => {
      const trimmed = value.trim().toLowerCase();
      if (!trimmed) throw new MandatoryError({ field: 'term.exclusive', name: 'Exclusive' });
      if (trimmed !== 'yes' && trimmed !== 'no') throw new WrongValueError({ field: 'term.exclusive', name: 'Exclusive' });
      return trimmed === 'yes';
    },
    /* h */'term.duration.from': (value: string) => {
      if (!value) throw new MandatoryError({ field: 'term.duration.from', name: 'Duration From'});
      return getDate(value, { field: 'term.duration.from', name: 'Start of Contract'}) as Date
    },
    /* i */'term.duration.to': (value: string) => {
      if (!value) throw new MandatoryError({ field: 'term.duration.to', name: 'Duration To'});
      return getDate(value, { field: 'term.duration.to', name: 'End of Contract'}) as Date
    },

    /* j */'term.licensedOriginal': (value: string) => {
      const trimmed = value.trim().toLowerCase();
      if (!trimmed) throw new MandatoryError({ field: 'term.licensedOriginal', name: 'Licensed Original' });
      if (trimmed !== 'yes' && trimmed !== 'no') throw new WrongValueError({ field: 'term.licensedOriginal', name: 'Licensed Original' });
      return trimmed === 'yes';
    },
    /* k */'term.dubbed': (value: string) => getStaticList('languages', value, separator, { field: 'term.dubbed', name: 'Dubbed' }, false) as Language[],
    /* l */'term.subtitle': (value: string) => getStaticList('languages', value, separator, { field: 'term.subtitle', name: 'Subtitle' }, false) as Language[],
    /* m */'term.caption': (value: string) => getStaticList('languages', value, separator, { field: 'term.caption', name: 'CC' }, false) as Language[],

    /* n */'contract.id': async (value: string) => {
      const trimmed = value.trim();
      if (trimmed && !blockframesAdmin) return new ValueWithWarning(firestore.createId(), adminOnlyWarning({ field: 'contract.id', name: 'Contract ID' }));
      if (!trimmed) return firestore.createId();
      const exist = await getContract(trimmed, contractService, contractCache);
      if (exist) throw new AlreadyExistError({ field: 'contract.id', name: 'Contract ID' });
      return trimmed;
    },
    /* o */'parentTerm': async (value: string, data: FieldsConfig) => {
      const trimmed = value.trim();
      if (trimmed && !blockframesAdmin) return new ValueWithWarning(firestore.createId(), adminOnlyWarning({ field: 'parentTerm', name: 'Mandate ID/Row' }));
      if (trimmed && data.contract.type === 'mandate') return new ValueWithWarning('', {
        type: 'warning',
        field: 'parentTerm',
        name: 'Unused Mandate ID/Row',
        reason: 'Mandate ID is used only for sales contracts, here the value will be omitted because the contract is a mandate.',
        hint: 'Remove the corresponding sheet field to silence this warning.'
      });
      if (data.contract.sellerId === centralOrgId.catalog) return new ValueWithWarning('', {
        type: 'warning',
        field: 'parentTerm',
        name: 'Unused Mandate ID/Row',
        reason: 'Mandate ID is used only for internal sales, here the value will be omitted because the sale is external.',
        hint: 'Remove the corresponding sheet field to silence this warning.'
      });
      if (!trimmed && data.contract.type === 'sale') throw new MandatoryError({ field: 'parentTerm', name: 'Mandate ID/Row' });
      const isId = isNaN(Number(trimmed));
      if (isId) {
        const exist = await checkParentTerm(trimmed, contractService, existingTermCache);
        if (!exist) throw new UnknownEntityError({ field: 'parentTerm', name: 'Mandate ID' });
        return trimmed;
      } else return Number(trimmed);
    },
    /* p */'_titleId': (value: string) => {
      if (value && !blockframesAdmin) return new ValueWithWarning('', adminOnlyWarning({ field: '_titleId', name: 'Import ID' }));
      if (value) return new ValueWithWarning('', {
        type: 'warning',
        field: '_titleId',
        name: 'Deprecated Import ID',
        reason: 'This field is not used anymore and will be removed, the value will be omitted.',
      });
    },
    /* q */'contract.stakeholders': async (value: string, data: FieldsConfig) => {
      const stakeholders = value.split(separator).filter(v => !!v).map(v => v.trim());
      const exists = await Promise.all(stakeholders.map(id => userExist(id, userService, existingUserCache)));
      const unknownStakeholder = exists.some(e => !e);
      if (unknownStakeholder) throw new UnknownEntityError({ field: 'contract.stakeholders', name: 'Stakeholders' });
      return [ data.contract.buyerId, data.contract.sellerId, ...stakeholders ];
    },
  };

  const results = await extract<FieldsConfig>(sheetTab.rows, fieldsConfig);


  for (const result of results) {
    const { data, errors, warnings } = result;

    const contract =  data.contract.type === 'sale'
      ? createSale({ ...data.contract as Sale})
      : createMandate({ ...data.contract as Mandate });

    const term = toTerm(data.term, contract.id, firestore);

    if (contract.type === 'sale') {
      if (typeof data.parentTerm === 'number') {
        contract.parentTermId = contracts[data.parentTerm - 2]?.terms[0]?.id; // excel lines start at 1 and first line is the column names
        if (!contract.parentTermId) errors.push({
          type: 'error',
          field: 'parentTerm',
          name: 'Wrong Mandate Row',
          reason: 'Mandate Row point to a wrong sheet line.',
          hint: 'Please check that the line number is correct and that the line is a mandate.'
        });
      } else {
        contract.parentTermId = data.parentTerm;
      }
    }

    contracts.push({ contract, terms: [term], errors: [ ...errors, ...warnings ], newContract: true });
  }

  return contracts;
}
