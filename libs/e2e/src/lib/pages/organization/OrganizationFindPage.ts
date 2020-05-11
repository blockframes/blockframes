const PATH = '/c/organization/find';

export default class OrganizationFindPage {
  constructor() {
    cy.get('organization-find');
  }

  public assertMoveToOrgFindPage() {
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(PATH)
    })
  }
}
