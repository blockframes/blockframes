
import { AngularFirestore } from '@angular/fire/firestore';

import {
  getDate,
  getOrgId,
  getTitleId,
  getContract,
  mandatoryError,
  checkParentTerm,
  WrongValueError,
  adminOnlyWarning,
  AlreadyExistError,
  UnknownEntityError,
  ContractsImportState,
  getUser,
  sheetHeaderLine,
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
  const userCache: Record<string, User> = {};
  const contractCache: Record<string, (Mandate | Sale)> = {};

  const contracts: ContractsImportState[] = [];

  // ! The order of the property should be the same as excel columns
  const fieldsConfig: FieldsConfigType = {
    /* a */'contract.titleId': async (value: string) => {
      if (!value) return mandatoryError({ field: 'contract.titleId', name: 'Title' });
      const titleId = await getTitleId(value, titleService, titleNameCache, userOrgId, blockframesAdmin);
      if (!titleId) throw new UnknownEntityError({ field: 'contract.titleId', name: 'Title' });
      return titleId;
    },
    /* b */'contract.type': (value: string) => {
      const lower = value.toLowerCase();
      if (!lower) return mandatoryError({ field: 'contract.type', name: 'Type' });
      const type = getKeyIfExists('contractType', lower[0].toUpperCase() + lower.substr(1));
      if (!type) throw new WrongValueError({ field: 'contract.type', name: 'Type' });
      if (type === 'mandate' && !blockframesAdmin) throw new Error(JSON.stringify({
        type: 'error',
        field: 'contract.type',
        name: `Forbidden Type`,
        reason: 'Only admin can import mandates.',
        hint: 'Please ensure the corresponding sheet field value is "sale".'
      }));
      return lower.toLowerCase() as 'mandate' | 'sale';
    },
    /* c */'contract.sellerId': async (value: string) => {
      if (!value) return mandatoryError({ field: 'contract.sellerId', name: 'Licensor' });
      if (value === 'Archipel Content') {
        if (!blockframesAdmin) throw new Error(JSON.stringify({
          type: 'error',
          field: 'contract.sellerId',
          name: `Forbidden Licensor`,
          reason: 'Internal sales don\'t need to be imported and will appear automatically on your dashboard.',
          hint: 'Please ensure that the Licensor name is not "Archipel Content". Only admin can import internal sales.'
        }));
        return centralOrgId.catalog;
      } else {
        const sellerId = await getOrgId(value, orgService, orgNameCache);
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
      if (!value) return mandatoryError({ field: 'contract.buyerId', name: 'Licensee' });
      if (data.contract.type === 'mandate') {
        if (value !== 'Archipel Content') throw new Error(JSON.stringify({
          type: 'error',
          field: 'contract.buyerId',
          name: 'Forbidden Licensee',
          reason: 'The Licensee name of a mandate must be "Archipel Content".',
          hint: 'Please edit the corresponding sheet field'
        }));
        return centralOrgId.catalog;
      } else {
        const isInternal = data.contract.sellerId === centralOrgId.catalog;
        const sellerId = await getOrgId(value, orgService, orgNameCache);
        if (isInternal && !sellerId) throw new UnknownEntityError({ field: 'contract.buyerId', name: 'Licensee Organization' });
        return sellerId;
      }
    },
    /* e */'term.territories': (value: string) => getStaticList('territories', value, separator, { field: 'term.territories', name: 'Territories' }) as Territory[],
    /* f */'term.medias': (value: string) =>  getStaticList('medias', value, separator, { field: 'term.medias', name: 'Medias' }) as Media[],
    /* g */'term.exclusive': (value: string) => {
      const lower = value.toLowerCase();
      if (!lower) return mandatoryError({ field: 'term.exclusive', name: 'Exclusive' });
      if (lower !== 'yes' && lower !== 'no') throw new WrongValueError({ field: 'term.exclusive', name: 'Exclusive' });
      return lower === 'yes';
    },
    /* h */'term.duration.from': (value: string) => {
      if (!value) return mandatoryError({ field: 'term.duration.from', name: 'Duration From'});
      return getDate(value, { field: 'term.duration.from', name: 'Start of Contract'}) as Date
    },
    /* i */'term.duration.to': (value: string) => {
      if (!value) return mandatoryError({ field: 'term.duration.to', name: 'Duration To'});
      return getDate(value, { field: 'term.duration.to', name: 'End of Contract'}) as Date
    },

    /* j */'term.licensedOriginal': (value: string) => {
      const lower = value.toLowerCase();
      if (!lower) return mandatoryError({ field: 'term.licensedOriginal', name: 'Licensed Original' });
      if (lower !== 'yes' && lower !== 'no') throw new WrongValueError({ field: 'term.licensedOriginal', name: 'Licensed Original' });
      return lower === 'yes';
    },
    /* k */'term.dubbed': (value: string) => getStaticList('languages', value, separator, { field: 'term.dubbed', name: 'Dubbed' }, false) as Language[],
    /* l */'term.subtitle': (value: string) => getStaticList('languages', value, separator, { field: 'term.subtitle', name: 'Subtitle' }, false) as Language[],
    /* m */'term.caption': (value: string) => getStaticList('languages', value, separator, { field: 'term.caption', name: 'CC' }, false) as Language[],

    /* n */'contract.id': async (value: string) => {
      if (value && !blockframesAdmin) return new ValueWithWarning(firestore.createId(), adminOnlyWarning({ field: 'contract.id', name: 'Contract ID' }));
      if (!value) return firestore.createId();
      const exist = await getContract(value, contractService, contractCache);
      if (exist) throw new AlreadyExistError({ field: 'contract.id', name: 'Contract ID' });
      return value;
    },
    /* o */'parentTerm': async (value: string, data: FieldsConfig) => {
      if (value && !blockframesAdmin) return new ValueWithWarning('', adminOnlyWarning({ field: 'parentTerm', name: 'Mandate ID/Row' }));
      if (value && data.contract.type === 'mandate') return new ValueWithWarning('', {
        type: 'warning',
        field: 'parentTerm',
        name: 'Unused Mandate ID/Row',
        reason: 'Mandate ID is used only for sales contracts, here the value will be omitted because the contract is a mandate.',
        hint: 'Remove the corresponding sheet field to silence this warning.'
      });
      if (!value && data.contract.type === 'sale' && data.contract.sellerId === centralOrgId.catalog) {
        return mandatoryError({ field: 'parentTerm', name: 'Mandate ID/Row' });
      }
      if (value && data.contract.type === 'sale' && data.contract.sellerId !== centralOrgId.catalog) {
        return new ValueWithWarning('', {
          type: 'warning',
          field: 'parentTerm',
          name: 'Unused Mandate ID/Row',
          reason: 'Mandate ID is used only for internal sales, here the value will be omitted because the sale is external.',
          hint: 'Remove the corresponding sheet field to silence this warning.'
        });
      }
      const isId = isNaN(Number(value));
      if (isId) {
        const exist = await checkParentTerm(value, contractService, contractCache);
        if (!exist) throw new UnknownEntityError({ field: 'parentTerm', name: 'Mandate ID' });
        return value;
      } else return Number(value);
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
      const exists = await Promise.all(stakeholders.map(id => getUser({ id }, userService, userCache)));
      const unknownStakeholder = exists.some(e => !e);
      if (unknownStakeholder) throw new UnknownEntityError({ field: 'contract.stakeholders', name: 'Stakeholders' });
      if (data.contract.type === 'mandate') {
        return [ data.contract.buyerId, data.contract.sellerId, ...stakeholders ];
      } else {
        if (data.contract.sellerId === centralOrgId.catalog) { // internal sale
          // seller ID is archipel, we don't need to add it, as mandate stakeholders will be copied here (copy is done bellow ~line 290)
          return [ data.contract.buyerId, ...stakeholders ];
        } else { // external sale
          // if the sale is external the seller is not archipel (it's the owner org), and the buyer is unknown by definition
          return [ data.contract.sellerId, ...stakeholders ]
        }
      }
    },
  };

  const results = await extract<FieldsConfig>(sheetTab.rows, fieldsConfig);


  for (const result of results) {
    const { data, errors } = result;

    const contract =  data.contract.type === 'sale'
      ? createSale({ ...data.contract as Sale})
      : createMandate({ ...data.contract as Mandate });

    const term = toTerm(data.term, contract.id, firestore);

    // for **internal** sales we should check the parentTerm
    const isInternalSale = contract.type === 'sale' && contract.sellerId === centralOrgId.catalog;
    if (isInternalSale) {
      if (typeof data.parentTerm === 'number') {
        const mandate = contracts[data.parentTerm - sheetHeaderLine.contracts - 1]; // first line is the column names
        contract.parentTermId = mandate?.terms[0]?.id;
        if (!mandate || !contract.parentTermId) errors.push({
          type: 'error',
          field: 'parentTerm',
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

    contracts.push({ contract, terms: [term], errors, newContract: true });
  }

  return contracts;
}
