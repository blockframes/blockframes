import { Organization } from '../../utils/type';
import { setForm, FormOptions } from '../../utils/functions';
import { SEC } from '../../utils/env';

const PATH = '/c/organization/create-congratulations'; //@TODO #4932 update E2E tests

export default class OrganizationCreatePendingPage {
  constructor() {
    cy.get('organization-create-pending', {timeout: 150 * SEC});
  }

  public assertMoveToOrgCreatePage() {
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(PATH);
    });
  }

  public fillName(name: string) {
    cy.get('organization-form input[test-id=name]', {timeout: 3 * SEC})
      .type(name);
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
