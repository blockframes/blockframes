import { App } from '@blockframes/model';

export interface PdfParamsFilters {
  avails?: string,
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
};