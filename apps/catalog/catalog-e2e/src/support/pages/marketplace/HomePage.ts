import NavbarPage from './NavbarPage';
import SearchPage from './SearchPage';
import { SEC } from '@blockframes/e2e/utils/env';

export default class HomePage extends NavbarPage {
  constructor() {
    super();
    cy.get('catalog-home', {timeout: 60 * SEC});
  }

  public clickViewTheLibrary() {
    cy.get('catalog-home a[test-id=library]', {timeout: 3 * SEC})
      .click();
    cy.wait(1 * SEC);
    return new SearchPage();
  }

  public clickFirstWishlistButton() {
    cy.get('catalog-home bf-slider').first().find('button[test-id=heart-button]').first().click();
    cy.wait(2 * SEC);
  }
}
