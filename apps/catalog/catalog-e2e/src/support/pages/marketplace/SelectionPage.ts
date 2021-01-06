export default class SelectionPage {
  constructor() {
    cy.get('[page-id=catalog-selection]');
  }

  public fillOffer() {
    cy.get('[page-id=catalog-selection] [test-id=selection-offer]').type('200');
  }

  public selectCurrency() {
    cy.get('[page-id=catalog-selection] [test-id=selection-currency]').click();
    cy.get('mat-option').contains('euro').click();
  }

}
