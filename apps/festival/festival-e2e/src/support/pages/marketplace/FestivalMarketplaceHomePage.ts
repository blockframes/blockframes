import FestivalDashboardHomePage from '../dashboard/FestivalDashboardHomePage';
import FestivalOrganizationListPage from './FestivalOrganizationListPage';

export default class FestivalMarketplaceHomePage {
  constructor() {
    cy.get('festival-marketplace-home');
  }

  goToDashboard() {
    cy.visit('/c/o/dashboard')
    return new FestivalDashboardHomePage();
  }

  clickOnMenu() {
    cy.get('festival-marketplace button[test-id=menu]').click();
  }

  selectSalesAgents() {
    cy.get('layout-marketplace a').contains('Sales Agents').click();
    return new FestivalOrganizationListPage();
  }
}
