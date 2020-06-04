import FestivalScreeningPage from "./FestivalScreeningPage";

const NAV_SCREENING = 'Screening Schedule';

export default class FestivalMarketplaceOrganizationTitlePage {
  constructor() {
    cy.get('festival-marketplace-organization-title', { timeout: 30000 });
  }

  clickOnScreeningSchedule() {
    cy.get('festival-marketplace-organization-view a').contains(NAV_SCREENING).click();
    return new FestivalScreeningPage();
  }
}
