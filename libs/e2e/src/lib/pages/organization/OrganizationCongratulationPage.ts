import { TO } from '../../utils/env';

const PATH = '/c/organization/create-congratulations';

export default class OrganizationCongratulationPage {

  constructor() {
    cy.get('organization-create-feedback', {timeout: TO.VSLOW_UPDATE});
  }

  public assertMoveToOrgCongratulationPage() {
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(PATH)
    })
  }
}
