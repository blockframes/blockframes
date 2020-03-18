import NavbarPage from './NavbarPage';
import SearchPage from './SearchPage';

export default class HomePage extends NavbarPage {
  constructor() {
    super();
    cy.get('catalog-home');
  }

  public clickViewTheLibrary() {
    cy.get('catalog-home a[test-id=library]').click();
    return new SearchPage();
  }

  public clickFirstWishlistButton() {
    cy.get('catalog-home button[test-id=heart-icon]').first().click();
    cy.wait(500);
  }
}
