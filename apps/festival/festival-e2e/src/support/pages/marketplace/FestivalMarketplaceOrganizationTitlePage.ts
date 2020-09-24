import FestivalScreeningPage from "./FestivalScreeningPage";
import { TO } from '@blockframes/e2e/utils/env';

const NAV_SCREENING = 'Screening Schedule';

export default class FestivalMarketplaceOrganizationTitlePage {
  constructor() {
    cy.get('festival-marketplace-organization-title', { timeout: TO.PAGE_LOAD });
  }

  clickOnScreeningSchedule() {
    cy.get('festival-marketplace-organization-view a', { timeout: TO.PAGE_ELEMENT })
      .contains(NAV_SCREENING).click();
    return new FestivalScreeningPage();
  }
}
