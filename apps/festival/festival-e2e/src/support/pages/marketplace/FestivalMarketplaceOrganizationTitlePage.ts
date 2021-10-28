import FestivalScreeningPage from "./FestivalScreeningPage";
import { SEC } from '@blockframes/e2e/utils/env';

const NAV_SCREENING = 'Screening Schedule';
const NAV_CONTACT   = 'Contact';

export default class FestivalMarketplaceOrganizationTitlePage {
  constructor() {
    cy.get('festival-marketplace-organization-title', { timeout: 60 * SEC });
  }

  clickOnScreeningSchedule() {
    cy.get('festival-marketplace-organization-view a', { timeout: 3 * SEC })
      .contains(NAV_SCREENING).click();
    return new FestivalScreeningPage();
  }

  clickOnProductionDetails() {
    cy.get('festival-marketplace-organization-view a', { timeout: 3 * SEC })
      .contains(NAV_CONTACT).click();
    cy.wait(5 * SEC);
  }
}
