import FestivalMarketplaceOrganizationTitlePage from "./FestivalMarketplaceOrganizationTitlePage";
import { TO } from '@blockframes/e2e/utils/env';

export default class FestivalOrganizationListPage {
  constructor() {
    cy.get('festival-organization-list', { timeout: 30000 });
  }

  clickOnOrganization(orgName: string) {
    cy.get('festival-organization-list org-card', { timeout: 60000 })
      .contains(orgName).parent().parent().find('a').click();
    cy.wait(TO.WAIT_1SEC);
    return new FestivalMarketplaceOrganizationTitlePage();
  }
}
