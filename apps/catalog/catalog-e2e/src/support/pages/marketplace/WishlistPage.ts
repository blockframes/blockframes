import NavbarPage from "./NavbarPage";

export default class WishlistPage extends NavbarPage {

  constructor() {
    super();
    cy.get('catalog-wishlist-view');
  }

  public clickSendToSellers() {
    cy.get('catalog-wishlist-view button[test-id=submit-to-sellers]').click();
    cy.wait(2000);
  }

  public assertNoCurrentWishlist() {
    cy.get('catalog-wishlist-current-repertory').should((table) => expect(table).length(0));
  }

  public assertMovieInCurrentWishlist(movieName: string) {
    cy.get('catalog-wishlist-current-repertory td').contains(movieName);
  }

  public assertNoMovieInWishlist() {
    cy.get('catalog-wishlist-current-repertory table').should((table) => expect(table).to.not.exist);
  }

  public assertMovieInSentWishlist(movieName: string) {
    cy.get('catalog-wishlist-current-repertory td').contains(movieName);
  }

  public removeMovieFromWishlist(movieName: string) {
    cy.get('catalog-wishlist-current-repertory').contains('tr', movieName).find('button[test-id=remove]').click();
    cy.wait(1000);
  }
}
