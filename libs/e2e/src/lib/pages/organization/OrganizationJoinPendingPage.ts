import { Organization } from '../../utils/type';
import { setForm, FormOptions } from '../../utils/functions';
import { SEC } from '../../utils/env';

const PATH = '/c/organization/join-congratulations'; //@TODO #4932 update E2E tests

export default class OrganizationJoinPendingPage {
  constructor() {
    cy.get('organization-join-pending', {timeout: 150 * SEC});
  }

  public assertMoveToOrgCreatePage() {
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(PATH);
    });
  }

  // Set the organization create form
  public testOrgForm(org: Organization) {
    cy.log("OrganizationCreatePage: Test all form fields");
    const selector = 'organization-form form input, mat-select';

    const formOpt: FormOptions = {
      inputValue: org
    }
    setForm(selector, formOpt);
  }
}
