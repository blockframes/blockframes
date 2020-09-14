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
    cy.get('nav [ng-reflect-router-link="avails"]', {timeout: 3000})
      .click();
    cy.get('catalog-movie-view [test-id=heart-button]', {timeout: 3000})
      .click();
    cy.wait(5000);
  }
}

