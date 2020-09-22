import FestivalMarketplaceOrganizationTitlePage from "./FestivalMarketplaceOrganizationTitlePage";

export default class FestivalOrganizationListPage {
  constructor() {
    cy.get('festival-organization-list', { timeout: 30000 });
  }

  clickOnOrganization(orgName: string) {
    cy.get('festival-organization-list org-card', { timeout: 60000 })
      .contains(orgName).parent().parent().find('a').click();
    return new FestivalMarketplaceOrganizationTitlePage();
  }
}
