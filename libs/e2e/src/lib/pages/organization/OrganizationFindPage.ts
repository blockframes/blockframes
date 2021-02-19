import { SEC } from '../../utils/env';

const PATH = '/c/organization/find'; //@TODO #4932 update E2E tests

export default class OrganizationFindPage {
  constructor() {
    cy.get('organization-find', {timeout: 150 * SEC});
  }

  public assertMoveToOrgFindPage() {
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(PATH)
    })
  }
}
