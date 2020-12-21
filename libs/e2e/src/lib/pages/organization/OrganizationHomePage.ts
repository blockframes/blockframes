import OrganizationCreatePage from './OrganizationCreatePage';
import OrganizationFindPage from './OrganizationFindPage';
import { SEC } from '../../utils/env';

const PATH = '/c/organization/home';

export default class OrganizationHomePage {
  constructor() {
    cy.get('organization-home', {timeout: 150 * SEC});
  }

  public assertMoveToOrgHomepage() {
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(PATH);
    });
  }

  public clickCreateOrganization() {
    cy.get('organization-home [value=create]mat-radio-button', {timeout: 3 * SEC})
      .click();
  }

  public clickFindOrganization() {
    cy.get('organization-home [value=find]mat-radio-button', {timeout: 3 * SEC})
      .click();
  }

  public clickSubmitToCreate() {
    cy.get('organization-home a[test-id=submit]', {timeout: 3 * SEC})
      .click();
    cy.wait(1 * SEC);
    return new OrganizationCreatePage();
  }

  public clickSubmitToFind() {
    cy.get('organization-home a[test-id=submit]', {timeout: 3 * SEC})
      .click();
    cy.wait(1 * SEC);
    return new OrganizationFindPage();
  }
}
