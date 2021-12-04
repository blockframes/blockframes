import { App } from "../apps";

export interface PdfParams {
  titleIds: string[],
  app: App
}

export interface PdfRequest {
  method: string,
  body: PdfParams
};