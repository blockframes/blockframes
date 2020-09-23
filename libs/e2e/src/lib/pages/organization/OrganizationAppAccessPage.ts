import OrganizationCongratulationPage from "./OrganizationCongratulationPage";

const PATH = '/c/organization/app-access';

export default class OrganizationAppAccessPage {
  constructor() {
    cy.get('organization-app-access');
  }

  public assertMoveToOrgAppAccessPage() {
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(PATH)
    })
  }

  public chooseMarketplace() {
    cy.get('organization-app-access mat-radio-button[value=marketplace]').click();
  }

  public chooseDashboard() {
    cy.get('organization-app-access mat-radio-button[value=dashboard]').click();
  }

  public clickSubmit() {
    cy.wait(8000); // let the time to this.query.getActiveId() to get populated
    cy.get('organization-app-access button[test-id=submit]').click();
    return new OrganizationCongratulationPage();
  }
}
