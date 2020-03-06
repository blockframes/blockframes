export default class OrganizationCongratulationPage {
  constructor() {
    cy.get('organization-create-feedback');
  }

  public assertMoveToOrgCongratulationPage() {
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq('/c/organization/create-congratulations')
    })
  }
}
