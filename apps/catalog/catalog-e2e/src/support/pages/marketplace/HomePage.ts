import NavbarPage from './NavbarPage';
import SearchPage from './SearchPage';
import { TO } from '@blockframes/e2e/utils/env';

export default class HomePage extends NavbarPage {
  constructor() {
    super();
    cy.get('catalog-home', {timeout: TO.PAGE_LOAD});
  }

  public clickViewTheLibrary() {
    cy.get('catalog-home a[test-id=library]', {timeout: TO.PAGE_ELEMENT})
      .click();
    cy.wait(TO.ONE_SEC);
    return new SearchPage();
  }

  public clickFirstWishlistButton() {
    cy.get('catalog-home bf-slider').first().find('button[test-id=heart-button]').first().click();
    cy.wait(2000);
  }
}
