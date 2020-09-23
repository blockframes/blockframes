const PATH = '/c/organization/create-congratulations';

export default class OrganizationCongratulationPage {

  constructor() {
    cy.wait(8000); // Let the page load
    cy.get('organization-create-feedback');
  }

  public assertMoveToOrgCongratulationPage() {
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(PATH)
    })
  }
}
