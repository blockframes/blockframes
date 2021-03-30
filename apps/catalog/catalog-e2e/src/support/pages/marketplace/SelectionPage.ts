
export default class SelectionPage {
  constructor() {
    cy.get('catalog-selection');
  }

  // public fillOffer() {
  //   cy.get('[page-id=catalog-selection] [test-id=selection-offer]').type('200');
  // }

  public selectCurrency(currency: string = 'Euro') {
    cy.get('mat-select[test-id=selection-currency]').click();
    cy.get('mat-option').contains(currency).click();
  }

  /** Check how many sections we should get on the selection page (one by sales agent and by film) */
  public checkNumberOfSection(number: number) {
    cy.get('section[test-id="avails-section"]').should('have.length', number);
    cy.log(`Find ${number} sections`);
  }

  public checkTitleContract(title: string) {
    cy.get('section[test-id="avails-section"]').find(`h2`).contains(title);
    cy.log(`Find section with ${title} movie`);
  }

  public fillPrice(number: number, index: number) {
    cy.get(`section[test-id="avails-section"]`)
      .find(`input[test-id="price-${index}"]`).type(`${number}`).blur();
    cy.get(`input[test-id="price-${index}"]`).should('contain.text', '')
  }

  public checkTotalPrice(amount: string) {
    cy.get('footer[test-id="footer-total-price"]').scrollIntoView()
      .get('p[test-id="total-price"]').invoke('text').should('contain', `${amount}`);
  }

  public deleteContract() {
    cy.get('section[test-id="avails-section"]').first().find('button[test-id="delete-contract"]').click();
  }

  public createNewOffer(specificText: string, deliveryText: string) {
    cy.get('footer[test-id="footer-total-price"] button[test-id="create-offer"]').click();
    cy.get('catalog-specific-terms').should('be.visible');

    // Test if the specific terms textarea has already a value, if it's the first offer for the organization, it has to be empty
    // But if the org has already did some offer, it will be filled with the last values
    cy.get('catalog-specific-terms textarea[test-id="specific-terms"]').invoke('val').then((value) => {
      if (!value) {
        cy.get('textarea[test-id="specific-terms"]').type(specificText);
      } else {
        cy.log('There is already existing text in the specific-terms textarea');
      }
    })

    // Same as specific terms textarea
    cy.get('catalog-specific-terms textarea[test-id="delivery-list"]').invoke('val').then((value) => {
      if (!value) {
        cy.get('textarea[test-id="delivery-list"]').type(deliveryText);
      } else {
        cy.log('There is already existing text in the delivery-list textarea');
      }
    })

    cy.get('button[test-id="send-offer"]').click();
  }
}
