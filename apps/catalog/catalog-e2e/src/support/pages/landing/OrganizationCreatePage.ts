export default class OrganizationCreatePage {
  constructor() {
    cy.get('organization-create');

  }

  public assertMoveToOrgCreatePage() {
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq('/c/organization/create')
    })
  }
}
