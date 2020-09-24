import { TO } from '../../utils/env';

const PATH = '/c/organization/find';

export default class OrganizationFindPage {
  constructor() {
    cy.get('organization-find', {timeout: TO.VSLOW_UPDATE});
  }

  public assertMoveToOrgFindPage() {
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(PATH)
    })
  }
}
