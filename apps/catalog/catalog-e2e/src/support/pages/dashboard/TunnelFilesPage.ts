import TunnelChainOfTitlesPage from "./TunnelChainOfTitlesPage";
import { uploadFile, assertUploadStatus } from "@blockframes/e2e/utils/functions";

const UPLOAD_STATUS = 'Your file is ready, it will be uploaded when you click on "Save".';

export default class TunnelFilesPage {
  constructor() {
    cy.get('catalog-movie-tunnel-media-file');
  }

  // Files

  public uploadPresentationDeck(p: string) {
    uploadFile(p, 'application/pdf', 'presentation-deck');
  }

  public assertPresentationDeckHasUploadSucceeded() {
    assertUploadStatus(UPLOAD_STATUS, 'presentation-deck');
  }

  public uploadScenario(p: string) {
    uploadFile(p, 'application/pdf', 'scenario');
  }

  public assertScenarioHasUploadSucceeded() {
    assertUploadStatus(UPLOAD_STATUS, 'scenario');
  }

  // File Links

  public clickNext() {
    cy.get('[test-id=next]').click();
    return new TunnelChainOfTitlesPage();
  }
}
