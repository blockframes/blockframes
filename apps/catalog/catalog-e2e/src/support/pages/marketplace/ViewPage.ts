import DistributionPage from "./DistributionPage";
import NavbarPage from "./NavbarPage";

export default class ViewPage extends NavbarPage {

  constructor() {
    super();
    cy.get('catalog-movie-view', { timeout: 20000 });
  }

  public clickDistributionDeals() {
    cy.get('a[test-id=distribution-deal-link]').click();
    return new DistributionPage();
  }

  public clickWishListButton() {
    cy.get('catalog-movie-view [test-id=heart-button]').click();
    cy.wait(5000);
  }
}

