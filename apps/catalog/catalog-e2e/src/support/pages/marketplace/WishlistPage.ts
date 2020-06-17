import NavbarPage from "./NavbarPage";

export default class WishlistPage extends NavbarPage {

  constructor() {
    super();
    cy.get('catalog-wishlist');
  }

  public clickSendToSellers() {
    cy.get('catalog-wishlist button[test-id=submit-to-sellers]').click();
    cy.wait(2000);
  }

  public assertNoCurrentWishlist() {
    cy.get('catalog-wishlist').should((table) => expect(table).length(0));
  }

  public assertMovieInCurrentWishlist(movieName: string) {
    cy.get('catalog-wishlist td').contains(movieName);
  }

  public assertNoMovieInWishlist() {
    cy.get('catalog-wishlist table').should((table) => expect(table).to.not.exist);
  }

  public assertMovieInSentWishlist(movieName: string) {
    cy.get('catalog-wishlist td').contains(movieName);
  }

  public removeMovieFromWishlist(movieName: string) {
    cy.get('catalog-wishlist').contains('tr', movieName).find('button[test-id=remove]').click();
    cy.wait(5000);
  }
}
