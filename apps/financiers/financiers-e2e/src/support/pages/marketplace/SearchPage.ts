import { SEC } from "@blockframes/e2e/utils/env";
import ViewPage from "./ViewPage";

export default class SearchPage {

  constructor() {
    cy.get('financiers-marketplace-title-list', {timeout: 60 * SEC});
  }

  public  getAllMovies(movieCount: number) {
    const movies = [];
    cy.get('movie-card article h6', {timeout: 30 * SEC}).then((m) => {
      for (let i =0; i < movieCount; i++) {
        movies.push(m[i].firstChild.textContent);
      }
      console.log(movies);
      cy.wrap(movies).as('movieList');
    })
  }

  public searchForMovies(title: string) {
    cy.get('input[test-id="search-input"]', {timeout: 3 * SEC})
      .type(title);
    cy.wait(0.5 * SEC);
  }

  /////////////
  // FILTERS //
  /////////////
  public clearAllFilters() {
    cy.get('[mattooltip="Clear all filters"]', {timeout: 3 * SEC})
      .click();
    cy.wait(3 * SEC);
  }


  ///////////////////////////
  // ACTIONS ON MOVIE CARD //
  ///////////////////////////
  public clickWishlistButton(movieName: string) {
    cy.get('movie-card', {timeout: 30 * SEC})
      .contains(movieName).parent().parent()
      .find('button[test-id=heart-button]').click('bottom', {force: true} );
    cy.wait(2 * SEC);
  }

  /** Click on a movie-card and navigate to the movie-view */
  public selectMovie(movieName: string) {
    cy.log(`=>selectMovie : {${movieName}}`);
    cy.get('movie-card', {timeout: 30 * SEC})
      .contains(movieName).parent().parent()
      .find('a').click();
    cy.wait(5 * SEC);
    return new ViewPage();
  }
}

