import NavbarPage from "./NavbarPage";
import { SEC } from "@blockframes/e2e/utils/env";

export default class WishlistPage extends NavbarPage {
  constructor() {
    super();
    cy.get('marketplace-wishlist', {timeout: 60 * SEC});
  }

  public clickSendToSellers() {
    cy.get('marketplace-wishlist button[test-id=submit-to-sellers]')
      .click();
    cy.wait(2000);
  }

  public assertNoCurrentWishlist() {
    cy.get('marketplace-wishlist')
      .should((table) => expect(table).length(0));
  }

  public assertMovieInCurrentWishlist(movieName: string) {
    cy.get('marketplace-wishlist td', {timeout: 10 * SEC})
      .contains(movieName);
  }

  public assertNoMovieInWishlist() {
    cy.get('marketplace-wishlist table')
      .should((table) => expect(table).to.not.exist);
  }

  public assertMovieInSentWishlist(movieName: string) {
    cy.get('marketplace-wishlist td').contains(movieName);
  }

  private removeMatchingMovie(movieNames: string[]) {
    movieNames.forEach(movieName => {
      cy.log(`Removing {${movieName}} from WishList..`);
      cy.get('marketplace-wishlist')
        .contains('tr', movieName)
        .find('button[test-id=remove]').click();
      cy.wait(3000);
    })
    cy.wait(2000);
  }

  /**
   * removeMovieFromWishlist removes movies from list
   *    clears all the movies if called without parameter
   * @param movieNames : an array of movies to search and remove
   */
  public removeMovieFromWishlist(movieCount: number = 0, movieNames: string[] = []) {
    if (movieCount === 0) {
      return;
    }

    cy.wait(15 * SEC);
    cy.get("marketplace-wishlist section", {timeout: 150 * SEC}).then($table => {
      if ($table.find("tr").length === 0) {
        cy.log("Wishlist empty...");
        return;
      }

      if (movieNames.length === 0) {
        const likedMovies = [];
        cy.get('marketplace-wishlist tr').each(($el, index) => {
          if (index === 0) return;
          const title = Cypress.$($el)[0].firstElementChild.textContent.trim()
          console.log(title);
          likedMovies.push(title);
        })
        .last().then(() => {
          console.table(likedMovies);
          movieNames = likedMovies;
          this.removeMatchingMovie(movieNames);
        })
        return;
      }

      this.removeMatchingMovie(movieNames);
    });
  }
}
