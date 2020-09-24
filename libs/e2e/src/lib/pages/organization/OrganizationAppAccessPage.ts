import OrganizationCongratulationPage from "./OrganizationCongratulationPage";
import { TO } from '../../utils/env';

const PATH = '/c/organization/app-access';

export default class OrganizationAppAccessPage {
  constructor() {
    cy.get('organization-app-access', {timeout: TO.PAGE_LOAD});
  }

  public assertMoveToOrgAppAccessPage() {
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(PATH)
    })
  }

  public chooseMarketplace() {
    cy.get('organization-app-access mat-radio-button[value=marketplace]', {timeout: TO.PAGE_ELEMENT})
      .click();
  }

  public chooseDashboard() {
    cy.get('organization-app-access mat-radio-button[value=dashboard]', {timeout: TO.PAGE_ELEMENT})
      .click();
  }

  public clickSubmit() {
    cy.get('organization-app-access button[test-id=submit]')
      .click({ force: true });
    cy.wait(TO.WAIT_1SEC);
    return new OrganizationCongratulationPage();
  }
}
