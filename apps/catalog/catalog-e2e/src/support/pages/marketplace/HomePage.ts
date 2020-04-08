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
    cy.get('catalog-home mat-carousel').first().find('button[test-id=heart-icon]').first().click( { force: true });
    cy.wait(2000);
  }
}
