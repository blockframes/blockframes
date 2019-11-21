import NavbarPage from "./NavbarPage";

export default class WishlistPage extends NavbarPage {

  constructor() {
    super();
    cy.get('catalog-wishlist-view', { timeout: 5000 });
  }

  public clickSendToSellers() {
    cy.get('catalog-wishlist-view button[test-id=submit-to-sellers]').click();
    cy.wait(2000);
  }

  public assertNoCurrentWishlist() {
    cy.get('catalog-wishlist-view button[test-id=submit-to-sellers]').should((button) => expect(button).length(0));
  }

  public assertMovieInWishlist(movieName: string) {
    cy.get('catalog-wishlist-current-repertory td').contains(movieName);
  }
}
