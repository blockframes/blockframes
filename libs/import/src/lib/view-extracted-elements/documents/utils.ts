import { DocumentsImportState, } from '@blockframes/import/utils';
import { MovieService } from '@blockframes/movie/service';
import { OrganizationService } from '@blockframes/organization/service';
import {
  Movie,
  Term,
  createTerm,
  createWaterfallDocument,
  WaterfallDocument
} from '@blockframes/model';
import { extract, SheetTab } from '@blockframes/utils/spreadsheet';
import { FieldsConfig, getDocumentConfig } from './fieldConfigs';
import { TermService } from '@blockframes/contract/term/service';
import { WaterfallDocumentsService } from '@blockframes/waterfall/documents.service';

function toTerm(rawTerm: FieldsConfig['term'][number], contractId: string, termId: string) {

  const {
    medias,
    duration,
    territories_excluded = [],
    territories_included = [],
    price,
    currency
  } = rawTerm;

  const territories = territories_included.filter(territory => !territories_excluded.includes(territory));

  const id = termId;

  return createTerm({
    id,
    contractId,
    medias,
    duration,
    territories,
    criteria: [],
    price,
    currency
  });
}

export async function formatDocument(
  sheetTab: SheetTab,
  orgService: OrganizationService,
  titleService: MovieService,
  waterfallDocumentsService: WaterfallDocumentsService,
  termService: TermService,
  userOrgId: string,
) {
  // Cache to avoid  querying db every time
  const orgNameCache: Record<string, string> = {};
  const titleCache: Record<string, Movie> = {};
  const documentCache: Record<string, WaterfallDocument> = {};
  const termCache: Record<string, Term> = {};
  const documents: DocumentsImportState[] = [];
  const caches = { orgNameCache, titleCache, documentCache, termCache };

  const option = {
    orgService,
    titleService,
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
    const document = createWaterfallDocument({ ...data.document, meta: data.meta as any });

    const terms = (data.term ?? []).map(term => toTerm(term, document.id, term.id || termService.createId()));

    documents.push({ document, terms, errors });
  }
  return documents;
}
