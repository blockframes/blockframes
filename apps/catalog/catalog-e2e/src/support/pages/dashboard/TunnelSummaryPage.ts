import TitlesDetailsPage from "./TitlesDetailsPage";

export default class TunnelSummaryPage {
  constructor() {
    cy.get('catalog-summary-tunnel');
  }

  public clickSubmit() {
    cy.get('catalog-summary-tunnel button[test-id=submit]').click();
    return new TitlesDetailsPage();
  }
}
