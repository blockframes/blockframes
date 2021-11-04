import FestivalMarketplaceOrganizationTitlePage from "./FestivalMarketplaceOrganizationTitlePage";
import { SEC } from '@blockframes/e2e/utils/env';

export default class FestivalOrganizationListPage {
  constructor() {
    cy.get('festival-organization-list', { timeout: 60 * SEC });
  }

  searchPartner(orgName: string) {
    //Wait for all orgs to load first
    cy.log('searchPartner: Waiting for partner page to load..');
    console.log('searchPartner: Waiting for partner page to load..');
    cy.get('[test-id="org-spinner"]', {timeout: 120 * SEC})
      .should('not.exist');

    cy.get('mat-form-field input', {timeout: 3 * SEC})
      .type(`${orgName}{enter}`, {force: true});
  }

  clickOnOrganization(orgName: string) {
    cy.log(`Locating org : ${orgName} - long!!`);
    console.log(`Locating org : ${orgName} - long!!`);
    cy.get('festival-organization-list org-card', { timeout: 60 * SEC })
      .contains(orgName).parent().parent().find('a').click();
    cy.wait(1 * SEC);
    return new FestivalMarketplaceOrganizationTitlePage();
  }
}
