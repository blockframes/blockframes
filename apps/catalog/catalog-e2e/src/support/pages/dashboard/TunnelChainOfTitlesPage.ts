import { uploadFile, assertUploadStatus } from "../../utils/utils";
import TunnelValuationPage from "./TunnelValuationPage";

export default class TunnelChainOfTitlesPage {
  constructor() {
    cy.get('catalog-chain-of-titles');
  }

  public uploadChainOfTitlesFile(p: string) {
    uploadFile(p, 'application/pdf', 'chain-titles');
  }

  public assertChainOfTitlesFileHasUploadStatus(content: string) {
    assertUploadStatus(content, 'chain-titles');
  }

  public clickNext() {
    cy.get('[test-id=next]').click();
    return new TunnelValuationPage();
  }
}
