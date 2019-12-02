import DistributionPage from "./DistributionPage";
import NavbarPage from "./NavbarPage";

export default class ViewPage extends NavbarPage {

  constructor() {
    super();
    cy.get('[page-id=catalog-movie-view]');
  }

  public clickDistributionRights() {
    cy.get('a[test-id=distribution-right-link]').click();
    return new DistributionPage();
  }

  public addMovieToWishlist() {
    cy.get('.heart-button').click();
  }
}

