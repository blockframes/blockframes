import OrganizationCongratulationPage from "./OrganizationCongratulationPage";
import { SEC } from '../../utils/env';

const PATH = '/c/organization/app-access';

export default class OrganizationAppAccessPage {
  constructor() {
    cy.get('organization-app-access', {timeout: 60 * SEC});
  }

  public assertMoveToOrgAppAccessPage() {
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(PATH)
    })
  }

  public chooseMarketplace() {
    cy.get('organization-app-access mat-radio-button[value=marketplace]', {timeout: 3 * SEC})
      .click();
  }

  public chooseDashboard() {
    cy.get('organization-app-access mat-radio-button[value=dashboard]', {timeout: 3 * SEC})
      .click();
  }

  public clickSubmit() {
    cy.get('organization-app-access button[test-id=submit]', {timeout: 3 * SEC})
      .click({ force: true });
    cy.wait(1 * SEC);
    return new OrganizationCongratulationPage();
  }
}
