import TunnelValuationPage from "./TunnelValuationPage";
import { uploadFile, assertUploadStatus } from "@blockframes/e2e/utils/functions";

const UPLOAD_STATUS = 'Success';

export default class TunnelChainOfTitlesPage {
  constructor() {
    cy.get('catalog-chain-of-titles');
  }

  public uploadChainOfTitlesFile(p: string) {
    uploadFile(p, 'application/pdf', 'chain-titles');
  }

  public assertChainOfTitlesFileHasUploadSucceeded() {
    assertUploadStatus(UPLOAD_STATUS, 'chain-titles');
  }

  public clickNext() {
    cy.get('[test-id=next]').click();
    return new TunnelValuationPage();
  }
}
