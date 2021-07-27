import { SEC } from "@blockframes/e2e/utils/env";
import { Currency } from "@blockframes/e2e/utils/type";
import { defaultCurrency } from '../../../fixtures/bucket';

export default class SelectionPage {
  constructor() {
    cy.get('catalog-selection', {timeout: 60 * SEC});
  }

  public selectCurrency(currency: Currency = defaultCurrency) {
    cy.log('Check if currency input is here.')
    cy.get('static-select[test-id=selection-currency]', {timeout: 30 * SEC})
      .should('contain', `${defaultCurrency.label}`);

    cy.get('static-select[test-id=selection-currency]', {timeout: 30 * SEC})
      .click({scrollBehavior: false});
    cy.get('mat-option', {timeout: 30 * SEC})
      .contains(currency.label)
      .click();
    cy.wait(0.5 * SEC);

    cy.log('Check if the currency is updated and stable on distribution right section.');
    cy.get(`header[test-id="avails-section"]`, {timeout: 30 * SEC})
      .first()
      .find(`mat-form-field[price]`, {timeout: 1 * SEC})
      .find('mat-icon[matPrefix]')
      .should('have.attr', 'ng-reflect-svg-icon', `${currency.value}`);
  }

  /** Check how many sections we should get on the selection page (one by sales agent and by film) */
  public checkNumberOfSection(number: number) {
    cy.get('header[test-id="avails-section"]', {timeout: 30 * SEC})
      .should('have.length', number);
    cy.log(`Found ${number} sections`);
  }

  public checkTitleContract(title: string) {
    cy.log(`Find section with ${title} movie`);
    cy.get('header[test-id="avails-section"]', {timeout: 30 * SEC})
      .find('h2').contains(title);
  }

  public fillPrice(title: string, price: number) {
    cy.get(`header[test-id="avails-section"]`, {timeout: 30 * SEC})
      .each(($el, i) => {
        cy.wrap($el).find('h2').then(($movie) => {
          if ($movie.text() === title) {
            cy.wrap($el).find(`input[test-id="price-${i}"]`, {timeout: 1 * SEC})
              .type(price.toString() + '{enter}').blur();
            cy.wait(1 * SEC);
            cy.log(`Movie: ${title} - cost: ${price}`);
          }
        });
      });
  }

  public checkTotalPrice(amount: string) {
    cy.get('footer[test-id="footer-total-price"]', {timeout: 30 * SEC}).scrollIntoView()
      .get('p[test-id="total-price"]', {timeout: 30 * SEC}).invoke('text').should('contain', `${amount}`);
  }

  public deleteContract() {
    cy.get('header[test-id="avails-section"]', {timeout: 30 * SEC}).first().find('button[test-id="delete-contract"]').click();
  }

  public createNewOffer(specificText: string, deliveryText: string) {
    cy.get('footer[test-id="footer-total-price"] button[test-id="create-offer"]', {timeout: 30 * SEC})
      .click();
    cy.wait(5 * SEC);
    cy.get('catalog-specific-terms', {timeout: 60 * SEC})
      .should('be.visible');

    // Test if the specific terms textarea has already a value, if it's the first offer for the organization, it has to be empty
    // But if the org has already did some offer, it will be filled with the last values
    cy.get('catalog-specific-terms textarea[test-id="specific-terms"]', {timeout: 30 * SEC})
      .invoke('val').then((value) => {
      if (!value) {
        cy.get('textarea[test-id="specific-terms"]', {timeout: 30 * SEC}).type(specificText);
        cy.log('Fill correctly specfic terms textarea');
      } else {
        cy.log('There is already existing text in the specific-terms textarea');
      }
    })

    // Same as specific terms textarea
    cy.get('catalog-specific-terms textarea[test-id="delivery-list"]', {timeout: 30 * SEC}).invoke('val')
      .then((value) => {
      if (!value) {
        cy.get('textarea[test-id="delivery-list"]', {timeout: 30 * SEC}).type(deliveryText);
        cy.log('Fill correctly delivery list textarea');
      } else {
        cy.log('There is already existing text in the delivery-list textarea');
      }
    });

    cy.get('button[test-id="send-offer"]', {timeout: 30 * SEC})
      .click();
  }
}
