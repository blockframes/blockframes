export default class OrganizationHomePage {
  constructor() {
    cy.get('[page-id=organization-home]', {timeout: 10000});

  }

  public assertMoveToOrgHomepage() {
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq('/layout/organization/home')
    })
  }
}
