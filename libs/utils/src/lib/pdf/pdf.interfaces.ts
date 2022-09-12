import { App, Module } from '@blockframes/model';

export interface PdfParams {
  titleIds: string[],
  app: App,
  module: Module,
  pageTitle?: string,
  orgId?: string,
}

export interface PdfRequest {
  method: string,
  body: PdfParams
};