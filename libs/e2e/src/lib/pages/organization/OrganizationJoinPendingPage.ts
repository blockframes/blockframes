import { SEC } from '../../utils/env';

const PATH = '/c/organization/join-congratulations';

export default class OrganizationJoinPendingPage {
  constructor() {
    cy.get('organization-join-pending', {timeout: 150 * SEC});
  }

  public assertMoveToOrgJoinPage() {
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(PATH);
    });
  }
}
