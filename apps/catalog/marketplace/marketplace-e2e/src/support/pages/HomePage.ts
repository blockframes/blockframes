import NavbarPage from './NavbarPage';
import SearchPage from './SearchPage';

export default class HomePage extends NavbarPage {
  constructor() {
    super();
    cy.get('[page-id=catalog-marketplace-homepage]');
  }

  public clickDiscover() {
    cy.get('[page-id=catalog-marketplace-homepage] a[test-id=discover]', {
      timeout: 10000
    }).click();
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
