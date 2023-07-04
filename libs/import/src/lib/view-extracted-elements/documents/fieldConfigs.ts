import {
  alreadyExistError,
  getTitleId,
  mandatoryError,
  unknownEntityError,
  getWaterfallDocument,
  getTerm,
  getOrgId
} from '@blockframes/import/utils';
import { ExtractConfig, getGroupedList } from '@blockframes/utils/spreadsheet';
import {
  Media,
  Movie,
  Territory,
  Duration,
  ContractType,
  Term,
  MovieCurrency,
  WaterfallDocument
} from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { OrganizationService } from '@blockframes/organization/service';
import { getKeyIfExists } from '@blockframes/utils/helpers';
import { getDate } from '@blockframes/import/utils';
import { WaterfallDocumentsService } from '@blockframes/waterfall/documents.service';
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
    duration: Duration;
    id?: string;
    price?: number;
    currency?: MovieCurrency;
  }[];
}

export type FieldsConfigType = ExtractConfig<FieldsConfig>;

export interface Caches {
  orgNameCache: Record<string, string>,
  titleCache: Record<string, Movie>,
  documentCache: Record<string, WaterfallDocument>,
  termCache: Record<string, Term>,
}

interface DocumentConfig {
  orgService: OrganizationService,
  titleService: MovieService,
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
    termCache
  } = caches;


  function getAdminConfig(): FieldsConfigType {

    // ! The order of the property should be the same as excel columns
    return {
        /* a */ 'document.waterfallId': async (value: string) => {
        if (!value) {
          throw mandatoryError(value, 'Waterfall Id');
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
        if (!value) throw mandatoryError(value, 'Owner');
        const orgId = await getOrgId(value, orgService, orgNameCache);
        return orgId || value;
      },
        /* e */ 'document.rootId': async (value: string) => {
        return value;
      },
        /* f */ 'document.signatureDate': async (value: string) => {
        if (!value) throw mandatoryError(value, 'Signature Date');
        return getDate(value, 'Signature Date') as Date;
      },
        /* g */ 'meta.type': (value: string) => {
        if (!value) throw mandatoryError(value, 'Type');
        const type = getKeyIfExists('contractType', value);
        return type;
      },
        /* h */ 'meta.sellerId': async (value: string) => {
        if (!value) throw mandatoryError(value, 'Licensor');
        const orgId = await getOrgId(value, orgService, orgNameCache);
        return orgId || value;
      },
        /* i */ 'meta.buyerId': async (value: string) => {
        if (!value) throw mandatoryError(value, 'Licensee');
        const orgId = await getOrgId(value, orgService, orgNameCache);
        return orgId || value;
      },
        /* j */ 'meta.price': async (value: string) => {
        return Number(value);
      },
        /* k */ 'meta.currency': async (value: string) => {
        const currency = getKeyIfExists('movieCurrencies', value);
        return currency;
      },
        /* l */ 'meta.duration.from': (value: string) => {
        return getDate(value, 'Start of Contract') as Date;
      },
        /* m */ 'meta.duration.to': (value: string) => {
        return getDate(value, 'End of Contract') as Date;
      },
        /* n */ 'term[].territories_included': (value: string) => getGroupedList(value, 'territories', separator),
        /* o */ 'term[].territories_excluded': (value: string) => getGroupedList(value, 'territories', separator, { required: false }),
        /* p */ 'term[].medias': (value: string) => getGroupedList(value, 'medias', separator),
        /* q */ 'term[].duration.from': (value: string) => {
        if (!value) throw mandatoryError(value, 'Duration From');
        return getDate(value, 'Start of Contract') as Date;
      },
        /* r */ 'term[].duration.to': (value: string) => {
        if (!value) throw mandatoryError(value, 'Duration To');
        return getDate(value, 'End of Contract') as Date;
      },
        /* s */ 'term[].id': async (value: string) => {
        if (!value) return termService.createId();
        const exist = await getTerm(value, termService, termCache);
        if (exist) throw alreadyExistError(value, 'Term ID');
        return value;
      },
        /* t */ 'term[].price': async (value: string) => {
        return Number(value);
      },
        /* u */ 'term[].currency': async (value: string) => {
        const currency = getKeyIfExists('movieCurrencies', value);
        return currency;
      },

    };
  }

  return getAdminConfig();
}
