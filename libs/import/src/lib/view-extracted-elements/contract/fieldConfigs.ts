import { ContractService } from "@blockframes/contract/contract/+state/contract.service";
import { adminOnlyWarning, alreadyExistError, BaseImportError, checkParentTerm, exceptionCaughtError, getContract, getOrgId, getTitleId, getUser, ImportError, mandatoryError, unknownEntityError, unusedMandateIdWarning, wrongValueError } from "@blockframes/import/utils";
import { ExtractConfig, getStaticList, getGroupedList } from '@blockframes/utils/spreadsheet';
import { ContractStatus, ImportContractStatus, Language, Mandate, Media, Movie, Sale, Territory, User } from "@blockframes/model";
import { MovieService } from "@blockframes/movie/+state/movie.service";
import { OrganizationService } from "@blockframes/organization/+state";
import { UserService } from "@blockframes/user/+state";
import { getKeyIfExists } from "@blockframes/utils/helpers";
import { centralOrgId } from "@env";
import { collection, doc, Firestore } from "firebase/firestore";
import { getDate } from '@blockframes/import/utils';
import { FormatConfig } from "./utils";

export interface FieldsConfig {
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

export type FieldsConfigType = ExtractConfig<FieldsConfig>;

export interface Caches {
  orgNameCache: Record<string, string>,
  titleCache: Record<string, Movie>,
  userCache: Record<string, User>,
  contractCache: Record<string, Mandate | Sale>,
}

interface ContractConfig{
  orgService: OrganizationService,
  titleService: MovieService,
  contractService: ContractService,
  userService: UserService,
  firestore: Firestore,
  blockframesAdmin: boolean,
  userOrgId: string,
  caches: Caches,
  config: FormatConfig,
  separator :string,
}
export function getContractConfig(option:ContractConfig) {
  const {
    orgService,
    titleService,
    contractService,
    userService,
    firestore,
    blockframesAdmin,
    userOrgId,
    caches,
    config,
    separator,
  } = option;

  const {
    orgNameCache,
    titleCache,
    userCache,
    contractCache
  } = caches;


  function getAdminConfig(): FieldsConfigType {

    // ! The order of the property should be the same as excel columns
    return {
        /* a */ 'contract.titleId': async (value: string) => {
        if (!value) {
          throw mandatoryError(value,'Title');
        }
        const titleId = await getTitleId(value.trim(), titleService, titleCache, userOrgId, blockframesAdmin);
        if (titleId) return titleId;
        throw unknownEntityError<string>('name or ID');
      },
        /* b */ 'contract.type': (value: string) => {
        const lower = value.toLowerCase();
        if (!lower) throw mandatoryError(value,'Type');
        const type = getKeyIfExists('contractType', lower[0].toUpperCase() + lower.substr(1));
        if (!type) throw wrongValueError('Type');
        if (type === 'mandate' && !blockframesAdmin) {
          const option = {
            name: 'Forbidden Type',
            reason: 'Only admin can import mandates.',
            message: 'Please ensure the corresponding sheet field value is "sale".',
            value,
          } as const;
          throw ImportError.newError(option);
        };
        return lower.toLowerCase() as 'mandate' | 'sale';
      },
        /* c */ 'contract.sellerId': async (value: string) => {
        if (!value) throw mandatoryError(value,'Licensor');
        if (value === 'Archipel Content' || value === centralOrgId.catalog) {
          if (!blockframesAdmin) {
            const option: BaseImportError<string> = {
              name: 'Forbidden Licensor',
              reason: 'Internal sales don\'t need to be imported and will appear automatically on your dashboard.',
              message: 'Please ensure that the Licensor name is not "Archipel Content". Only admin can import internal sales.',
              value,
            };
            throw ImportError.newError(option)
          };
          return centralOrgId.catalog;
        } else {
          let sellerId = await getOrgId(value, orgService, orgNameCache);
          if (!sellerId) {
            const seller = await orgService.getValue(value);
            if (!seller) throw unknownEntityError('Licensor Organization');
            return sellerId = value;
          }
          if (!blockframesAdmin && sellerId !== userOrgId) {
            const option = {
              name: 'Forbidden Licensor',
              reason: 'You should be the seller of this contract. The Licensor name should be your organization name.',
              message: 'Please edit the corresponding sheet field',
              value,
            } as const;
            throw ImportError.newError(option);
          };
          return sellerId;
        }
      },
        /* d */ 'contract.buyerId': async (value: string, data: FieldsConfig) => {
        if (data.contract.type === 'mandate') {
          if (!value) throw mandatoryError(value,'Licensee');
          if (value !== 'Archipel Content' && value !== centralOrgId.catalog) {
            const option: BaseImportError<string> = {
              name: 'Forbidden Licensee',
              reason: 'The Licensee name of a mandate must be "Archipel Content".',
              value,
              message: 'Please edit the corresponding sheet field',
            };
            throw ImportError.newError(option)
          }
          return centralOrgId.catalog;
        }
        return '';
      },
        /* e */ 'term[].territories_included': (value: string) => getGroupedList(value, 'territories', separator),
        /* f */ 'term[].territories_excluded': (value: string) => getGroupedList(value, 'territories', separator, { required: false }),
        /* g */ 'term[].medias': (value: string) => getGroupedList(value, 'medias', separator),
        /* h */ 'term[].exclusive': (value: string) => {
        const lower = value.toLowerCase();
        if (!lower) throw mandatoryError(value,'Exclusive');
        if (lower !== 'yes' && lower !== 'no') throw wrongValueError('Exclusive');
        return lower === 'yes';
      },
        /* i */ 'term[].duration.from': (value: string) => {
        if (!value) throw mandatoryError(value,'Duration From');
        return getDate(value, 'Start of Contract') as Date;
      },
        /* j */ 'term[].duration.to': (value: string) => {
        if (!value) throw mandatoryError(value,'Duration To');
        return getDate(value, 'End of Contract') as Date;
      },

        /* k */ 'term[].licensedOriginal': (value: string) => {
        const lower = value.toLowerCase();
        if (!lower) throw mandatoryError(value,'Licensed Original');
        if (lower !== 'yes' && lower !== 'no') throw wrongValueError('Licensed Original');
        return lower === 'yes';
      },
        /* l */ 'contract.status': (value: string) => {
        if (!value) throw mandatoryError(value,'Status');
        const statusCorrespondences: Record<ImportContractStatus, ContractStatus> = {
          'In Negotiation': 'negotiating',
          'Accepted': 'accepted',
          'Declined': 'declined',
          'On Signature': 'accepted',
          'Signed': 'accepted',
        };
        return statusCorrespondences[value];
      },
        /* m */ 'term[].dubbed': (value: string) => getStaticList('languages', value, separator, 'Dubbed', false),
        /* n */ 'term[].subtitle': (value: string) => getStaticList('languages', value, separator, 'Subtitle', false),
        /* o */ 'term[].caption': (value: string) => getStaticList('languages', value, separator, 'CC', false),

        /* p */ 'contract.id': async (value: string) => {
        if (value && !blockframesAdmin) throw adminOnlyWarning(doc(collection(firestore, '_')).id, 'Contract ID');
        if (!value) return doc(collection(firestore, '_')).id;
        const exist = await getContract(value, contractService, contractCache);
        if (exist) throw alreadyExistError('Contract ID');
        return value;
      },
        /* q */ 'parentTerm': async (value: string, data: FieldsConfig) => {
        if (value && !blockframesAdmin) throw adminOnlyWarning('', 'Mandate ID/Row');
        if (value && data.contract.type === 'mandate')
          throw unusedMandateIdWarning(value);
        if (
          !value &&
          data.contract.type === 'sale' &&
          data.contract.sellerId === centralOrgId.catalog
        ) {
          throw mandatoryError(value,'Mandate ID/Row');
        }
        const isId = isNaN(Number(value));
        if (isId) {
          const exist = await checkParentTerm(value, contractService, contractCache);
          if (!exist) throw unknownEntityError('Mandate ID');
          return value;
        } else return Number(value);
      },
        /* r */ 'contract.stakeholders': async (value: string, data: FieldsConfig) => {
        const stakeholders = value.split(separator).filter(v => !!v).map(v => v.trim());
        const exists = await Promise.all(stakeholders.map(id => getUser({ id }, userService, userCache)));
        const unknownStakeholder = exists.some(e => !e);
        if (unknownStakeholder) throw unknownEntityError('Stakeholders');
        if (data.contract.type === 'mandate') {
          return [data.contract.buyerId, data.contract.sellerId, ...stakeholders];
        } else {
          if (data.contract.sellerId === centralOrgId.catalog) {
            // internal sale
            // seller ID is archipel, we don't need to add it, as mandate stakeholders will be copied here (copy is done bellow ~line 290)
            return [data.contract.buyerId, ...stakeholders];
          } else { // external sale
            // if the sale is external the seller is not archipel (it's the owner org), and the buyer is unknown by definition
            return [data.contract.sellerId, ...stakeholders]
          }
        }
      },
    };
  }

  function getSellerConfig(): FieldsConfigType {

    // ! The order of the property should be the same as excel columns
    return {
      //@Continue from here
        /* a */ 'contract.titleId': async (value: string) => {
        if (!value) throw mandatoryError(value,'Title');
        try {
          const titleId = await getTitleId(value.trim(), titleService, titleCache, userOrgId, blockframesAdmin);
          if (!titleId) throw unknownEntityError<string>('Title');
          return titleId;
        } catch (err) {
          const options = {
            name: 'Error on title name or ID',
            message: err.message,
            type: 'error',
            value,
          } as const;
          throw exceptionCaughtError(options);
        }

      },
        /* b */ 'contract.sellerId': async (value: string) => {
        if (!value) throw mandatoryError(value,'Licensor');
        if (value === 'Archipel Content' || value === centralOrgId.catalog) {
          if (!blockframesAdmin) {
            const option: BaseImportError<string> = {
              name: 'Forbidden Licensor',
              reason: 'Internal sales don\'t need to be imported and will appear automatically on your dashboard.',
              message: 'Please ensure that the Licensor name is not "Archipel Content". Only admin can import internal sales.',
              value,
            };
            throw ImportError.newError(option);
          }
          return centralOrgId.catalog;
        } else {
          let sellerId = await getOrgId(value, orgService, orgNameCache);
          if (!sellerId) {
            const seller = await orgService.getValue(value);
            if (!seller) throw unknownEntityError('Licensor Organization');
            return sellerId = value;
          }
          if (!blockframesAdmin && sellerId !== userOrgId) {
            const option: BaseImportError<string> = {
              name: 'Forbidden Licensor',
              reason: 'You should be the seller of this contract. The Licensor name should be your organization name.',
              message: 'Please edit the corresponding sheet field',
              value,
            };
            throw ImportError.newError(option);
          };
          return sellerId;
        }
      },
        /* c */ 'contract.buyerId': async (value: string, data: FieldsConfig) => {
        if (data.contract.type === 'mandate') {
          if (!value) throw mandatoryError(value,'Licensee');
          if (value !== 'Archipel Content' && value !== centralOrgId.catalog) {
            const option: BaseImportError<string> = {
              name: 'Forbidden Licensee',
              reason: 'The Licensee name of a mandate must be "Archipel Content".',
              message: 'Please edit the corresponding sheet field',
              value,
            };
            throw ImportError.newError(option);
          }
          return centralOrgId.catalog;
        }
        return '';
      },
        /* d */ 'term[].territories_included': (value: string) => getGroupedList(value, 'territories', separator),
        /* e */ 'term[].territories_excluded': (value: string) => getGroupedList(value, 'territories', separator, { required: false }),
        /* f */ 'term[].medias': (value: string) => getGroupedList(value, 'medias', separator),
        /* g */ 'term[].exclusive': (value: string) => {
        const lower = value.toLowerCase();
        if (!lower) throw mandatoryError(value,'Exclusive');
        if (lower !== 'yes' && lower !== 'no') throw wrongValueError('Exclusive');
        return lower === 'yes';
      },
        /* h */ 'term[].duration.from': (value: string) => {
        if (!value) throw mandatoryError(value,'Duration From');
        return getDate(value, 'Start of Contract') as Date;
      },
        /* i */ 'term[].duration.to': (value: string) => {
        if (!value) throw mandatoryError(value,'Duration To');
        return getDate(value, 'End of Contract') as Date;
      },

        /* j */ 'term[].licensedOriginal': (value: string) => {
        const lower = value.toLowerCase();
        if (!lower) throw mandatoryError(value,'Licensed Original');
        if (lower !== 'yes' && lower !== 'no') throw wrongValueError('Licensed Original');
        return lower === 'yes';
      },
        /* k */ 'contract.status': (value: string) => {
        if (!value) throw mandatoryError(value,'Status');
        const statusCorrespondences: Record<ImportContractStatus, ContractStatus> = {
          'In Negotiation': 'negotiating',
          'Accepted': 'accepted',
          'Declined': 'declined',
          'On Signature': 'accepted',
          'Signed': 'accepted',
        };
        return statusCorrespondences[value];
      },
        /* l */ 'term[].dubbed': (value: string) => getStaticList('languages', value, separator, 'Dubbed', false),
        /* m */ 'term[].subtitle': (value: string) => getStaticList('languages', value, separator, 'Subtitle', false),
        /* n */ 'term[].caption': (value: string) => getStaticList('languages', value, separator, 'CC', false),

        /* o */ 'contract.id': async (value: string) => {
        if (value && !blockframesAdmin) throw adminOnlyWarning(doc(collection(firestore, '_')).id, 'Contract ID');
        if (!value) return doc(collection(firestore, '_')).id;
        const exist = await getContract(value, contractService, contractCache);
        if (exist) throw alreadyExistError('Contract ID');
        return value;
      },
        /* p */ 'parentTerm': async (value: string, data: FieldsConfig) => {
        if (value && !blockframesAdmin) throw adminOnlyWarning('', 'Mandate ID/Row');
        if (
          !value &&
          data.contract.type === 'sale' &&
          data.contract.sellerId === centralOrgId.catalog
        ) {
          throw mandatoryError(value,'Mandate ID/Row');
        }
        const isId = isNaN(Number(value));
        if (isId) {
          const exist = await checkParentTerm(value, contractService, contractCache);
          if (!exist) throw unknownEntityError('Mandate ID');
          return value;
        } else return Number(value);
      },
        /* q */ 'contract.stakeholders': async (value: string, data: FieldsConfig) => {
        const stakeholders = value.split(separator).filter(v => !!v).map(v => v.trim());
        const exists = await Promise.all(stakeholders.map(id => getUser({ id }, userService, userCache)));
        const unknownStakeholder = exists.some(e => !e);
        if (unknownStakeholder) throw unknownEntityError('Stakeholders');
        if (data.contract.type === 'mandate') {
          return [data.contract.buyerId, data.contract.sellerId, ...stakeholders];
        } else {
          if (data.contract.sellerId === centralOrgId.catalog) {
            // internal sale
            // seller ID is archipel, we don't need to add it, as mandate stakeholders will be copied here (copy is done bellow ~line 290)
            return [data.contract.buyerId, ...stakeholders];
          } else { // external sale
            // if the sale is external the seller is not archipel (it's the owner org), and the buyer is unknown by definition
            return [data.contract.sellerId, ...stakeholders]
          }
        }
      },
    };
  }

  return config.isSeller ? getSellerConfig() : getAdminConfig();
}
