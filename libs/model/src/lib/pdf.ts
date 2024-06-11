import { Organization } from './organisation';
import { App } from './static';

export const pdfExportLimit = 450;

export interface PdfParamsFilters {
  avails?: string,
  availsFormValue?: string,
  contentType?: string,
  genres?: string,
  originCountries?: string,
}

export interface PdfParams {
  titleIds: string[],
  app: App,
  orgId?: string,
  filters: PdfParamsFilters
}

export interface PdfRequest {
  method: string,
  body: PdfParams
}

export interface StatementPdfParams {
  waterfallId: string;
  statementId: string;
  number: number;
  versionId: string;
  fileName?: string;
  org?: Organization;
}

export interface StatementPdfRequest {
  method: string,
  body: StatementPdfParams
}