export default class SelectionPage {
  constructor() {
    cy.get('catalog-selection');
  }

  public fillOffer() {
    cy.get('[page-id=catalog-selection] [test-id=selection-offer]').type('200');
  }

  public selectCurrency(currency: string = 'Euro') {
    cy.get('mat-select[test-id=selection-currency]').click();
    cy.get('mat-option').contains(currency).click();
  }

  public fillPrice(number: number) {
    cy.get('input[test-id="price"]').type(`${number}`);
  }

  /** Check how many sections we should get on the selection page (one by sales agent and by film) */
  public checkNumberOfSection(number: number) {
    cy.get('section[test-id="avails-section"]').should('have.length', number);
    cy.log(`Find ${number} sections`);
  }

  public checkTitleAndOffer(title: string, offer: number) {
    cy.get('section[test-id="avails-section"]').find('h2').contains(title);
    cy.log(`Find section with ${title} movie`);
    // cy.get('table tr[test-id="table-filter-row"]').should('have.length', offer);
    // cy.log(`Find ${offer} offers for this movie`);
  }

}
