import NavbarPage from "./NavbarPage";

export default class WishlistPage extends NavbarPage {

  constructor() {
    super();
    cy.get('catalog-wishlist');
  }

  public clickSendToSellers() {
    cy.get('catalog-wishlist button[test-id=submit-to-sellers]')
      .click();
    cy.wait(2000);
  }

  public assertNoCurrentWishlist() {
    cy.get('catalog-wishlist')
      .should((table) => expect(table).length(0));
  }

  public assertMovieInCurrentWishlist(movieName: string) {
    cy.get('catalog-wishlist td').contains(movieName);
  }

  public assertNoMovieInWishlist() {
    cy.get('catalog-wishlist table')
      .should((table) => expect(table).to.not.exist);
  }

  public assertMovieInSentWishlist(movieName: string) {
    cy.get('catalog-wishlist td').contains(movieName);
  }

  /**
   * removeMovieFromWishlist removes movies from list
   *    clears all the movies if called without parameter
   * @param movieNames : an array of movies to search and remove
   */
  public removeMovieFromWishlist(movieNames: string[] = []) {
    if (movieNames.length === 0) {
      let likedMovies = [];
      cy.get('catalog-wishlist tr').each(($el, index) => {
        if (index === 0) return;
        // cy.wrap($el)
        //   .find('.').click({force: true});
        //cy.wait(2000);
        let v = Cypress.$($el)[0].firstElementChild.textContent.trim()
        console.log(v);
        likedMovies.push(v);
      })
      .last().then(() => {
        console.table(likedMovies);
        movieNames = likedMovies;

        movieNames.forEach(movieName => {
          cy.log(`Removing {${movieName}} from WishList..`);
          cy.get('catalog-wishlist')
            .contains('tr', movieName)
            .find('button[test-id=remove]').click();
          cy.wait(3000);
        })
        cy.wait(2000);
                
      })
      //return;
    }

    movieNames.forEach(movieName => {
      cy.log(`Removing {${movieName}} from WishList..`);
      cy.get('catalog-wishlist')
        .contains('tr', movieName)
        .find('button[test-id=remove]').click();
      cy.wait(3000);
    })
    cy.wait(2000);
  }
}
