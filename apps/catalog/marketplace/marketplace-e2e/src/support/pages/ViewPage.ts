import DistributionPage from "./DistributionPage";

export default class ViewPage {

  constructor() {
    cy.get('[page-id=catalog-movie-view]');
  }

  public clickDistributionDeals() {
    cy.get('a[test-id=distribution-deal-link]').click();
    return new DistributionPage();
  }
}

