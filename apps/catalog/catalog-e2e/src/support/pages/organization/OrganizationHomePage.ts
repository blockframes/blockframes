import OrganizationCreatePage from "./OrganizationCreatePage";
import OrganizationFindPage from "./OrganizationFindPage";

export default class OrganizationHomePage {
  constructor() {
    cy.get('organization-home');
  }

  public assertMoveToOrgHomepage() {
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq('/c/organization/home')
    })
  }

  public clickCreateOrganization() {
    cy.get('[value=create]mat-radio-button').click();
  }

  public clickFindOrganization() {
    cy.get('[value=find]mat-radio-button').click();
  }

  public clickSubmitToCreate() {
    cy.get('[test-id=submit]').click();
    return new OrganizationCreatePage();
  }

  public clickSubmitToFind() {
    cy.get('[test-id=submit]').click();
    return new OrganizationFindPage();
  }
}
