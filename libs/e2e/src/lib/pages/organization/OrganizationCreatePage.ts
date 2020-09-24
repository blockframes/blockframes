import OrganizationAppAccessPage from './OrganizationAppAccessPage';
import { Organization } from '../../utils/type';
import { setForm, FormOptions } from '../../utils/functions';
import { TO } from '../../utils/env';

const PATH = '/c/organization/create';

export default class OrganizationCreatePage {
  constructor() {
    cy.get('organization-create', {timeout: TO.VSLOW_UPDATE});
  }

  public assertMoveToOrgCreatePage() {
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(PATH);
    });
  }

  public fillName(name: string) {
    cy.get('organization-form input[test-id=name]', {timeout: TO.PAGE_ELEMENT})
      .type(name);
  }

  /** If navigate is set to false, this doesn't return a new page. */
  public clickCreate(navigate: boolean = true) {
    cy.get('organization-create button[test-id=create]', {timeout: TO.PAGE_ELEMENT})
      .click({ force: true });
    cy.wait(TO.THREE_SEC);
    if (navigate) {
      return new OrganizationAppAccessPage();
    }
  }

  // Parameters : fieldSelectors in the form
  // Value: Object data to pass in to fill the form
  // Callback : Function to handle special testId with custom form operation 
  // Logs : cy.log = fields that did not have test IDs set.
  // Debug output console.table() all the selectors and values filled.  
  public testOrgForm(org: Organization) {
    cy.log("OrganizationCreatePage: Test all form fields");
    const selector = 'organization-form form input, mat-select';

    const formOpt: FormOptions = {
      inputValue: org
    }
    setForm(selector, formOpt);
  }
}
