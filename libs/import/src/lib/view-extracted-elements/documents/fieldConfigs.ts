import {
  alreadyExistError,
  getTitleId,
  mandatoryError,
  unknownEntityError,
  getWaterfallDocument,
  getTerm,
  getOrgId,
  getRightholderId,
  getDate
} from '../../utils';
import { ExtractConfig, getGroupedList } from '@blockframes/utils/spreadsheet';
import {
  Media,
  Movie,
  Territory,
  Duration,
  ContractType,
  Term,
  MovieCurrency,
  WaterfallDocument,
  WaterfallRightholder
} from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { OrganizationService } from '@blockframes/organization/service';
import { getKeyIfExists } from '@blockframes/utils/helpers';
import { WaterfallDocumentsService } from '@blockframes/waterfall/documents.service';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { TermService } from '@blockframes/contract/term/service';

export interface FieldsConfig {
  document: {
    waterfallId: string;
    type: 'financingPlan' | 'budget' | 'contract';
    id?: string;
    ownerId: string;
    rootId: string;
    signatureDate?: Date;
  };
  meta: {
    type: ContractType;
    sellerId: string;
    buyerId: string;
    price?: number;
    currency?: MovieCurrency;
    duration?: Duration;
  },
  term: {
    territories_included: Territory[];
    territories_excluded: Territory[];
    medias: Media[];
    id?: string;
    price?: number;
    currency?: MovieCurrency;
  }[];
}

type FieldsConfigType = ExtractConfig<FieldsConfig>;

interface Caches {
  orgNameCache: Record<string, string>,
  titleCache: Record<string, Movie>,
  rightholderCache: Record<string, WaterfallRightholder[]>,
  documentCache: Record<string, WaterfallDocument>,
  termCache: Record<string, Term>,
}

interface DocumentConfig {
  orgService: OrganizationService,
  titleService: MovieService,
  waterfallService: WaterfallService,
  termService: TermService,
  waterfallDocumentsService: WaterfallDocumentsService,
  userOrgId: string,
  caches: Caches,
  separator: string,
}

export function getDocumentConfig(option: DocumentConfig) {
  const {
    orgService,
    titleService,
    waterfallService,
    termService,
    waterfallDocumentsService,
    userOrgId,
    caches,
    separator,
  } = option;

  const {
    orgNameCache,
    titleCache,
    documentCache,
    termCache,
    rightholderCache
  } = caches;

  function getAdminConfig(): FieldsConfigType {

    // ! The order of the property should be the same as excel columns
    return {
        /* a */ 'document.waterfallId': async (value: string) => {
        if (!value) {
          throw mandatoryError(value, 'Waterfall ID');
        }
        const titleId = await getTitleId(value.trim(), titleService, titleCache, userOrgId, true);
        if (titleId) return titleId;
        throw unknownEntityError<string>(value, 'name or ID');
      },
        /* b */ 'document.type': (value: 'financingPlan' | 'budget' | 'contract') => {
        if (!value) throw mandatoryError(value, 'Type');
        return value;
      },
        /* c */ 'document.id': async (value: string, data: FieldsConfig) => {
        if (!value) return waterfallDocumentsService.createId();
        const exist = await getWaterfallDocument(value, waterfallDocumentsService, documentCache, data.document.waterfallId);

        if (exist) throw alreadyExistError(value, 'Document ID');
        return value;
      },
        /* d */ 'document.ownerId': async (value: string) => {
        if (!value) throw mandatoryError(value, 'Document owner');
        let orgId = await getOrgId(value, orgService, orgNameCache);
        if (!orgId) {
          const owner = await orgService.getValue(value);
          if (!owner) throw unknownEntityError(value, 'Document owner');
          orgId = value;
        }
        return orgId;
      },
        /* e */ 'document.rootId': (value: string) => {
        return value;
      },
        /* f */ 'document.signatureDate': (value: string) => {
        if (!value) throw mandatoryError(value, 'Signature Date');
        return getDate(value, 'Signature Date');
      },
        /* g */ 'meta.type': (value: string) => {
        if (!value) throw mandatoryError(value, 'Type');
        const type = getKeyIfExists('contractType', value);
        return type;
      },
        /* h */ 'meta.sellerId': async (value: string, data: FieldsConfig) => {
        if (!value) throw mandatoryError(value, 'Licensor');
        const rightholderID = await getRightholderId(value, data.document.waterfallId, waterfallService, rightholderCache);
        return rightholderID;
      },
        /* i */ 'meta.buyerId': async (value: string, data: FieldsConfig) => {
        if (!value) throw mandatoryError(value, 'Licensee');
        const rightholderID = await getRightholderId(value, data.document.waterfallId, waterfallService, rightholderCache);
        return rightholderID;
      },
        /* j */ 'meta.price': (value: string) => {
        return Number(value);
      },
        /* k */ 'meta.currency': (value: string): MovieCurrency => {
        if (value?.trim() === '€') return 'EUR';
        if (value?.trim() === '$') return 'USD';
        if (value?.trim() === '£') return 'GBP';

        const currency = getKeyIfExists('movieCurrencies', value);
        return currency;
      },
        /* l */ 'meta.duration.from': (value: string) => {
        return getDate(value, 'Start of Contract');
      },
        /* m */ 'meta.duration.to': (value: string) => {
        return getDate(value, 'End of Contract');
      },
        /* n */ 'term[].territories_included': (value: string) => getGroupedList(value, 'territories', separator),
        /* o */ 'term[].territories_excluded': (value: string) => getGroupedList(value, 'territories', separator, { required: false }),
        /* p */ 'term[].medias': (value: string) => getGroupedList(value, 'medias', separator),
        /* q */ 'term[].id': async (value: string) => {
        if (!value) return termService.createId();
        const exist = await getTerm(value, termService, termCache);
        if (exist) throw alreadyExistError(value, 'Term ID');
        return value;
      },
        /* r */ 'term[].price': (value: string) => {
        return Number(value);
      },
        /* s */ 'term[].currency': (value: string) => {
        const currency = getKeyIfExists('movieCurrencies', value);
        return currency;
      },

    };
  }

  return getAdminConfig();
}
