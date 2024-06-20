import {
  alreadyExistError,
  getTitleId,
  mandatoryError,
  unknownEntityError,
  getWaterfallDocument,
  getTerm,
  getOrgId,
  getRightholderId,
  getDate,
  valueToId
} from '../../utils';
import { ExtractConfig, getGroupedList } from '@blockframes/utils/spreadsheet';
import {
  Media,
  Movie,
  Territory,
  Duration,
  RightholderRole,
  Term,
  WaterfallDocument,
  WaterfallRightholder,
  WaterfallInvestment
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
    name: string;
    id: string;
    ownerId: string;
    rootId: string;
    signatureDate: Date;
  };
  meta: {
    type: RightholderRole;
    sellerId: string;
    buyerId: string;
    price: WaterfallInvestment[];
    duration?: Duration;
  },
  term: {
    territories_included: Territory[];
    territories_excluded: Territory[];
    medias: Media[];
    id: string;
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
        /* c */ 'document.name': async (value: string, data: FieldsConfig) => {
        if (!value) throw mandatoryError(value, 'Document name');
        // Create ID from name
        data.document.id = valueToId(value);
        const exist = await getWaterfallDocument(data.document.id, waterfallDocumentsService, documentCache, data.document.waterfallId);

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
        return valueToId(value);
      },
        /* f */ 'document.signatureDate': (value: string) => {
        if (!value) throw mandatoryError(value, 'Signature Date');
        return getDate(value, 'Signature Date');
      },
        /* g */ 'meta.type': (value: string) => {
        if (!value) throw mandatoryError(value, 'Type');
        return getKeyIfExists('rightholderRoles', value);
      },
        /* h */ 'meta.sellerId': (value: string, data: FieldsConfig) => {
        if (!value) throw mandatoryError(value, 'Licensor');
        return getRightholderId(value, data.document.waterfallId, waterfallService, rightholderCache);
      },
        /* i */ 'meta.buyerId': (value: string, data: FieldsConfig) => {
        if (!value) throw mandatoryError(value, 'Licensee');
        return getRightholderId(value, data.document.waterfallId, waterfallService, rightholderCache);
      },
        /* j */ 'meta.price': (value: string, data: FieldsConfig) => {
        return [{ value: Number(value), date: data.document.signatureDate }];
      },
        /* k */ 'meta.duration.from': (value: string) => {
        return getDate(value, 'Start of Contract');
      },
        /* l */ 'meta.duration.to': (value: string) => {
        return getDate(value, 'End of Contract');
      },
        /* m */ 'term[].territories_included': (value: string) => getGroupedList(value, 'territories', separator, { required: false }),
        /* n */ 'term[].territories_excluded': (value: string) => getGroupedList(value, 'territories', separator, { required: false }),
        /* o */ 'term[].medias': (value: string) => getGroupedList(value, 'medias', separator, { required: false }),
        /* p */ 'term[].id': async (value: string) => {
        if (!value) return termService.createId();
        const exist = await getTerm(value, termService, termCache);
        if (exist) throw alreadyExistError(value, 'Term ID');
        return value;
      },

    };
  }

  return getAdminConfig();
}
