import DistributionPage from "./DistributionPage";

export default class ViewPage {

  constructor() {
    cy.get('[page-id=catalog-movie-view]');
  }

  public clickDistributionRights() {
    cy.get('a[test-id=distribution-right-link]').click();
    return new DistributionPage();
  }
}

