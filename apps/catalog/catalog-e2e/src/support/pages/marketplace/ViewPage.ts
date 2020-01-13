import DistributionPage from "./DistributionPage";
import NavbarPage from "./NavbarPage";

export default class ViewPage extends NavbarPage {

  constructor() {
    super();
    cy.get('[page-id=catalog-movie-view]');
  }

  public clickDistributionDeals() {
    cy.get('a[test-id=distribution-deal-link]').click();
    return new DistributionPage();
  }

  public clickWishListButton() {
    cy.get('.heart-button').click();
    cy.wait(500);
  }
}

