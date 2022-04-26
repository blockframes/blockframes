import { App } from "@blockframes/model"

export interface PdfParams {
  titleIds: string[],
  app: App
}

export interface PdfRequest {
  method: string,
  body: PdfParams
};