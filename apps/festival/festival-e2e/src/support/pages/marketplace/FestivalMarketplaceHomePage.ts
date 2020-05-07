import FestivalDashboardHomePage from '../dashboard/FestivalDashboardHomePage';

export default class FestivalMarketplaceHomePage {
  constructor() {
    cy.get('festival-marketplace-home');
  }

  goToDashboard() {
    cy.visit('/c/o/dashboard')
    return new FestivalDashboardHomePage();
  }
}