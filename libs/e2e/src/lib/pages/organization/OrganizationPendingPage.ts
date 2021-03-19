import { SEC } from '../../utils/env';

const CREATEPATH = '/c/organization/create-congratulations';
const JOINPATH = '/c/organization/join-congratulations';

export default class OrganizationPendingPage {
  constructor() {
    cy.get('organization-pending', {timeout: 150 * SEC});
  }

  public assertMoveToOrgCreatePage() {
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(CREATEPATH);
    });
  }

  public assertMoveToOrgJoinPage() {
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(JOINPATH);
    });
  }
}
