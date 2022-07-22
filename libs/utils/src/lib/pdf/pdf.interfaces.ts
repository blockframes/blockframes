import { App } from '@blockframes/model';

export interface PdfParams {
  titleIds: string[],
  app: App,
  pageTitle?: string
}

export interface PdfRequest {
  method: string,
  body: PdfParams
};