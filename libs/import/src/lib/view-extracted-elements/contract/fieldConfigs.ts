import { ContractService } from '@blockframes/contract/contract/service';
import {
  adminOnlyWarning, alreadyExistError, getContract,
  getOrgId, getTitleId, ImportError, mandatoryError,
  unknownEntityError, wrongValueError, SpreadsheetImportError, wrongTemplateError, ImportWarning, getTerm
} from '@blockframes/import/utils';
import { ExtractConfig, getStaticList, getGroupedList } from '@blockframes/utils/spreadsheet';
import {
  ContractStatus, ImportContractStatus, Language, Mandate, Media, Movie,
  Sale, Territory, User, Duration, ContractType, appName, Term
} from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { OrganizationService } from '@blockframes/organization/service';
import { getKeyIfExists } from '@blockframes/utils/helpers';
import { getDate } from '@blockframes/import/utils';
import { FormatConfig } from './utils';
import { TermService } from '@blockframes/contract/term/service';

export interface FieldsConfig {
  contract: {
    titleId: string;
    type: ContractType;
    sellerId: string;
    buyerId: string;
    id?: string;
    stakeholders: string[];
    status: string,
  };
  term: {
    territories_included: Territory[];
    territories_excluded: Territory[];
    medias: Media[];
    exclusive: boolean;
    duration: Duration;
    licensedOriginal: boolean;
    dubbed: Language[];
    subtitle: Language[];
    caption: Language[];
    id?: string;
  }[];
}

export type FieldsConfigType = ExtractConfig<FieldsConfig>;

export interface Caches {
  orgNameCache: Record<string, string>,
  titleCache: Record<string, Movie>,
  userCache: Record<string, User>,
  contractCache: Record<string, Mandate | Sale>,
  termCache: Record<string, Term>,
}

interface ContractConfig {
  orgService: OrganizationService,
  titleService: MovieService,
  contractService: ContractService,
  termService: TermService,
  blockframesAdmin: boolean,
  userOrgId: string,
  caches: Caches,
  config: FormatConfig,
  separator: string,
}

export function getContractConfig(option: ContractConfig) {
  const {
    orgService,
    titleService,
    contractService,
    termService,
    blockframesAdmin,
    userOrgId,
    caches,
    config,
    separator,
  } = option;

  const {
    orgNameCache,
    titleCache,
    contractCache,
    termCache
  } = caches;

  /**
   * Used to import internal mandates and sales from CRM app.
   */
  function getAdminConfig(): FieldsConfigType {

    // ! The order of the property should be the same as excel columns
    return {
        /* a */ 'contract.titleId': async (value: string) => {
        if (!value) {
          throw mandatoryError(value, 'Title');
        }
        const titleId = await getTitleId(value.trim(), titleService, titleCache, userOrgId, true);
        if (titleId) return titleId;
        throw unknownEntityError<string>(value, 'name or ID');
      },
        /* b */ 'contract.type': (value: string) => {
        if (!value) throw mandatoryError(value, 'Type');
        const type = getKeyIfExists('contractType', value);
        if (!type) {
          /**This is a seller template being imported in lieu of an admin template. */
          throw wrongTemplateError('seller');
        }

        return type;
      },
        /* c */ 'contract.sellerId': async (value: string) => {
        if (!value) throw mandatoryError(value, 'Licensor');
        let sellerId = await getOrgId(value, orgService, orgNameCache, config.centralOrg);
        if (!sellerId) {
          const seller = await orgService.getValue(value);
          if (!seller) throw unknownEntityError(value, 'Licensor Organization');
          sellerId = value;
        }
        return sellerId;
      },
        /* d */ 'contract.buyerId': async (value: string, data: FieldsConfig) => {
        let buyerId = await getOrgId(value, orgService, orgNameCache, config.centralOrg);
        if (!buyerId && value) {
          const seller = await orgService.getValue(value);
          if (!seller) throw unknownEntityError(value, 'Licensee Organization');
          buyerId = value;
        }
        if (buyerId && buyerId !== config.centralOrg.id) { // TODO #9419
          const option: SpreadsheetImportError = {
            name: `Licensee is not ${config.centralOrg.name}`,
            reason: `If contract is imported for ${appName.catalog} app, the Licensee should be "${config.centralOrg.name}".`,
            message: 'Please, verify this field.',
          };
          data.contract.buyerId = buyerId;
          throw new ImportWarning(value, option);
        };
        return data.contract.type === 'mandate' ? config.centralOrg.id : '';
      },
        /* e */ 'term[].territories_included': (value: string) => getGroupedList(value, 'territories', separator),
        /* f */ 'term[].territories_excluded': (value: string) => getGroupedList(value, 'territories', separator, { required: false }),
        /* g */ 'term[].medias': (value: string) => getGroupedList(value, 'medias', separator),
        /* h */ 'term[].exclusive': (value: string) => {
        const lower = value.toLowerCase();
        if (!lower) throw mandatoryError(value, 'Exclusive');
        if (lower !== 'yes' && lower !== 'no') throw wrongValueError(value, 'Exclusive');
        return lower === 'yes';
      },
        /* i */ 'term[].duration.from': (value: string) => {
        if (!value) throw mandatoryError(value, 'Duration From');
        return getDate(value, 'Start of Contract') as Date;
      },
        /* j */ 'term[].duration.to': (value: string) => {
        if (!value) throw mandatoryError(value, 'Duration To');
        return getDate(value, 'End of Contract') as Date;
      },
        /* k */ 'term[].licensedOriginal': (value: string) => {
        const lower = value.toLowerCase();
        if (!lower) throw mandatoryError(value, 'Licensed Original');
        if (lower !== 'yes' && lower !== 'no') throw wrongValueError(value, 'Licensed Original');
        return lower === 'yes';
      },
        /* l */ 'contract.status': (value: string) => {
        if (!value) throw mandatoryError(value, 'Status');
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
        if (!value) return contractService.createId();
        const exist = await getContract(value, contractService, contractCache);
        if (exist) throw alreadyExistError(value, 'Contract ID');
        return value;
      },
        /* q */ 'contract.stakeholders': async (value: string, data: FieldsConfig) => {
        const _value = value.split(separator).filter(v => !!v).map(v => v.trim());

        const stakeholders = await Promise.all(_value.map(async (orgIdOrName) => {
          const stakeholderId = await getOrgId(orgIdOrName, orgService, orgNameCache, config.centralOrg);
          if (stakeholderId) return stakeholderId;
          const stakeholder = await orgService.getValue(orgIdOrName);
          return stakeholder?.id;
        }));

        const unknownStakeholder = stakeholders.some(e => !e);
        if (unknownStakeholder) throw unknownEntityError(value, 'Stakeholders');
        if (data.contract.type === 'mandate') {
          return Array.from(new Set([data.contract.buyerId, data.contract.sellerId, ...stakeholders]));
        } else { // external sale, no buyerId
          return Array.from(new Set([data.contract.sellerId, ...stakeholders]));
        }
      },
      /* r */ 'term[].id': async (value: string) => {
        if (!value) return termService.createId();
        const exist = await getTerm(value, termService, termCache);
        if (exist) throw alreadyExistError(value, 'Term ID');
        return value;
      },
    };
  }

  /**
   * Used only to import external sales from catalog app.
   * Licensor (contract.sellerId) : if not blockframesAdmin, licensor must be same orgId as current user. 
   * Licensee (contract.buyerId) : is left empty
   */
  function getCatalogConfig(): FieldsConfigType {

    // ! The order of the property should be the same as excel columns
    return {
        /* a */ 'contract.titleId': async (value: string) => {
        if (!value) throw mandatoryError(value, 'Title');
        const titleId = await getTitleId(value.trim(), titleService, titleCache, userOrgId, blockframesAdmin);
        if (titleId) return titleId;
        throw unknownEntityError<string>(value, 'name or ID');
      },
        /* b */ 'contract.sellerId': async (value: string) => {
        if (!value) throw mandatoryError(value, 'Licensor');
        if (getKeyIfExists('contractType', value)) {
          /**This is an admin template being imported in lieu of a seller template. */
          throw wrongTemplateError('admin');
        }

        let sellerId = await getOrgId(value, orgService, orgNameCache, config.centralOrg);
        if (!sellerId) {
          const seller = await orgService.getValue(value);
          if (!seller) throw unknownEntityError(value, 'Licensor Organization');
          sellerId = value;
        }
        if (!blockframesAdmin && sellerId !== userOrgId) {
          const option: SpreadsheetImportError = {
            name: 'Forbidden Licensor',
            reason: 'The Licensor name should be your organization name.',
            message: 'Please edit the corresponding sheet field',
          };
          throw new ImportError(value, option);
        };
        return sellerId;
      },
        /* c */ 'contract.buyerId': () => {
        return '';
      },
        /* d */ 'term[].territories_included': (value: string) => getGroupedList(value, 'territories', separator),
        /* e */ 'term[].territories_excluded': (value: string) => getGroupedList(value, 'territories', separator, { required: false }),
        /* f */ 'term[].medias': (value: string) => getGroupedList(value, 'medias', separator),
        /* g */ 'term[].exclusive': (value: string) => {
        const lower = value.toLowerCase();
        if (!lower) throw mandatoryError(value, 'Exclusive');
        if (lower !== 'yes' && lower !== 'no') throw wrongValueError(value, 'Exclusive');
        return lower === 'yes';
      },
        /* h */ 'term[].duration.from': (value: string) => {
        if (!value) throw mandatoryError(value, 'Duration From');
        return getDate(value, 'Start of Contract') as Date;
      },
        /* i */ 'term[].duration.to': (value: string) => {
        if (!value) throw mandatoryError(value, 'Duration To');
        return getDate(value, 'End of Contract') as Date;
      },

        /* j */ 'term[].licensedOriginal': (value: string) => {
        const lower = value.toLowerCase();
        if (!lower) throw mandatoryError(value, 'Licensed Original');
        if (lower !== 'yes' && lower !== 'no') throw wrongValueError(value, 'Licensed Original');
        return lower === 'yes';
      },
        /* k */ 'contract.status': (value: string) => {
        if (!value) throw mandatoryError(value, 'Status');
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
        if (value && !blockframesAdmin) throw adminOnlyWarning(contractService.createId());
        if (!value) return contractService.createId();
        const exist = await getContract(value, contractService, contractCache);
        if (exist) throw alreadyExistError(value, 'Contract ID');
        return value;
      },
        /* p */ 'contract.stakeholders': async (value: string, data: FieldsConfig) => {
        const _value = value.split(separator).filter(v => !!v).map(v => v.trim());

        const stakeholders = await Promise.all(_value.map(async (orgIdOrName) => {
          const stakeholderId = await getOrgId(orgIdOrName, orgService, orgNameCache, config.centralOrg);
          if (stakeholderId) return stakeholderId;
          const stakeholder = await orgService.getValue(orgIdOrName);
          return stakeholder?.id;
        }));

        const unknownStakeholder = stakeholders.some(e => !e);
        if (unknownStakeholder) throw unknownEntityError(value, 'Stakeholders');
        // The sale is external the seller is not archipel (it's the owner org), and the buyer is unknown by definition
        return Array.from(new Set([data.contract.sellerId, ...stakeholders]));
      },
    };
  }

  switch (config.app) {
    case 'catalog':
      return getCatalogConfig();
    default:
      if (blockframesAdmin) return getAdminConfig();
      throw wrongTemplateError('admin');
  }

}
