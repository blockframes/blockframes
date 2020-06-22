import TunnelFilesPage from "./TunnelFilesPage";

export default class TunnelPromotionalImagesPage {
  constructor() {
    cy.get('catalog-tunnel-media-image');
  }

  public clickNext() {
    cy.get('[test-id=next]').click();
    return new TunnelFilesPage();
  }
}
