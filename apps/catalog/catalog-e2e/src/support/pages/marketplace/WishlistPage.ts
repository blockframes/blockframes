import NavbarPage from "./NavbarPage";

export default class WishlistPage extends NavbarPage {

  constructor() {
    super();
    cy.get('catalog-wishlist-view', { timeout: 5000 });
  }

  public clickSendToSellers() {
    cy.get('[test-id=currentWishlist] button[test-id=submit-to-sellers]').click();
    cy.wait(2000);
  }

  public assertNoCurrentWishlist() {
    cy.get('[test-id=currentWishlist]').should((table) => expect(table).length(0));
  }

  public assertMovieInCurrentWishlist(movieName: string) {
    cy.get('[test-id=currentWishlist] td').contains(movieName);
  }

  public assertNoMovieInWishlist() {
    cy.get('[test-id=currentWishlist] table').children('tr').should((tr) => expect(tr).to.not.exist);
  }

  public assertMovieInSentWishlist(movieName: string) {
    cy.get('[test-id=sentWishlist] td').contains(movieName);
  }

  public removeMovieFromWishlist(movieName: string) {
    cy.get('[test-id=currentWishlist]').contains(movieName).parent('td').parent('tr').within(() => {
      cy.get('button').click();
    });
    cy.wait(1000);
  }
}
