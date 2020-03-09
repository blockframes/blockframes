import OrganizationCongratulationPage from "./OrganizationCongratulationPage";

export default class OrganizationAppAccessPage {
  constructor() {
    cy.get('organization-app-access');
  }

  public assertMoveToOrgAppAccessPage() {
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq('/c/organization/app-access')
    })
  }

  public chooseMarketplace() {
    cy.get('mat-radio-button[value=marketplace]').click();
  }

  public chooseDashboard() {
    cy.get('mat-radio-button[value=dashboard]').click();
  }

  public clickSubmit() {
    cy.get('button[test-id=submit]').click();
    return new OrganizationCongratulationPage();
  }
}
