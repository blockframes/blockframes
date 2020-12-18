import { SEC } from '../../utils/env';

const PATH = '/c/organization/create-congratulations';

export default class OrganizationCongratulationPage {

  constructor() {
    cy.get('organization-create-feedback', {timeout: 150 * SEC});
  }

  public assertMoveToOrgCongratulationPage() {
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(PATH)
    })
  }
}
