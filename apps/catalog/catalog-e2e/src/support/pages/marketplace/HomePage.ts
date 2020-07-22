import NavbarPage from './NavbarPage';
import SearchPage from './SearchPage';

export default class HomePage extends NavbarPage {
  constructor() {
    super();
    cy.get('catalog-home', {timeout: 10000});
  }

  public clickViewTheLibrary() {
    cy.get('catalog-home a[test-id=library]').click();
    return new SearchPage();
  }

  public clickFirstWishlistButton() {
    cy.get('catalog-home bf-slider').first().find('button[test-id=heart-button]').first().click();
    cy.wait(2000);
  }
}
