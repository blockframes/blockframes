export default class DistributionPage {
  constructor() {
    cy.get('[page-id=distribution-right]');
  }

  public selectDates() {
    cy.get('[page-id=distribution-right] [test-id=distribution-date-panel]').click();
  }
}
