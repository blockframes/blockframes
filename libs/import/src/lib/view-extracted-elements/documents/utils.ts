import { DocumentsImportState } from '../../utils';
import { MovieService } from '@blockframes/movie/service';
import { OrganizationService } from '@blockframes/organization/service';
import {
  Movie,
  Term,
  createTerm,
  createWaterfallDocument,
  WaterfallDocument,
  WaterfallRightholder,
  WaterfallDocumentMeta,
  isContract,
  rightholderGroups
} from '@blockframes/model';
import { extract, SheetTab } from '@blockframes/utils/spreadsheet';
import { FieldsConfig, getDocumentConfig } from './fieldConfigs';
import { TermService } from '@blockframes/contract/term/service';
import { WaterfallDocumentsService } from '@blockframes/waterfall/documents.service';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';

function toTerm(rawTerm: FieldsConfig['term'][number], waterfallId: string, contractId: string, termId: string) {

  const {
    medias,
    territories_excluded = [],
    territories_included = [],
    price,
    currency
  } = rawTerm;

  const territories = territories_included.filter(territory => !territories_excluded.includes(territory));

  const id = termId;

  const term = createTerm({
    id,
    contractId,
    titleId: waterfallId,
    medias,
    territories,
    criteria: [],
    price,
    currency
  });

  term.duration = { from: null, to: null };

  return term;
}

export async function formatDocument(
  sheetTab: SheetTab,
  orgService: OrganizationService,
  titleService: MovieService,
  waterfallService: WaterfallService,
  waterfallDocumentsService: WaterfallDocumentsService,
  termService: TermService,
  userOrgId: string,
) {
  // Cache to avoid  querying db every time
  const orgNameCache: Record<string, string> = {};
  const titleCache: Record<string, Movie> = {};
  const rightholderCache: Record<string, WaterfallRightholder[]> = {};
  const documentCache: Record<string, WaterfallDocument> = {};
  const termCache: Record<string, Term> = {};
  const documents: DocumentsImportState[] = [];
  const caches = { orgNameCache, titleCache, documentCache, termCache, rightholderCache };

  const option = {
    orgService,
    titleService,
    waterfallService,
    termService,
    waterfallDocumentsService,
    userOrgId,
    caches,
    separator: ';'
  };

  const fieldsConfig = getDocumentConfig(option);

  const results = await extract<FieldsConfig>(sheetTab.rows, fieldsConfig, 11);
  for (const result of results) {
    const { data, errors } = result;
    const document = createWaterfallDocument({ ...data.document, meta: data.meta as WaterfallDocumentMeta });

    documents.push({ document, terms: getTerms(document, data.term), errors, rightholders: rightholderCache });
  }
  return documents;
}

function getTerms(document: WaterfallDocument, terms: FieldsConfig['term'][number][] = []) {
  if (isContract(document) && rightholderGroups.withTerms.includes(document.meta.type)) {
    return terms.map(term => toTerm(term, document.waterfallId, document.id, term.id));
  } else {
    return [];
  }
}
