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

  public clickWishlistButton(movieName: string) {
    cy.get('[page-id=catalog-marketplace-homepage] li').contains(movieName)
      .parent().parent()
      .within(() => {
        cy.get('button').click();
      });
    cy.wait(500);
  }
}
