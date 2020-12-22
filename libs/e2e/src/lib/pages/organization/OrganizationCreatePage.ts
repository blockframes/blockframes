import OrganizationAppAccessPage from './OrganizationAppAccessPage';
import { Organization } from '../../utils/type';
import { setForm, FormOptions } from '../../utils/functions';
import { SEC } from '../../utils/env';

const PATH = '/c/organization/create';

export default class OrganizationCreatePage {
  constructor() {
    cy.get('organization-create', {timeout: 150 * SEC});
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

  /** If navigate is set to false, this doesn't return a new page. */
  public clickCreate(navigate: boolean = true) {
    cy.get('organization-create button[test-id=create]', {timeout: 3 * SEC})
      .click({ force: true });
    cy.wait(3 * SEC);
    if (navigate) {
      return new OrganizationAppAccessPage();
    }
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
