// import OrganizationCreatePage from './OrganizationCreatePage';
import { SEC } from '../../utils/env';

export default class OrganizationLiteFormPage {
  constructor() {
  }

  // public assertMoveToOrgHomepage() {
  //   cy.location().should(loc => {
  //     expect(loc.pathname).to.eq(PATH);
  //   });
  // }

  // public clickCreateOrganization() {
  //   cy.get('organization-home [value=create]mat-radio-button', {timeout: 3 * SEC})
  //     .click();
  // }

  // public clickFindOrganization() {
  //   cy.get('organization-home [value=find]mat-radio-button', {timeout: 3 * SEC})
  //     .click();
  // }

  // public clickSubmitToCreate() {
  //   cy.get('organization-home a[test-id=submit]', {timeout: 3 * SEC})
  //     .click();
  //   cy.wait(1 * SEC);
  //   return new OrganizationCreatePage();
  // }

  public createNewOrg() {
    cy.get('algolia-autocomplete').type('newOrganization1');
    cy.get('mat-option[test-id="createNewOrgOption"]').click();
  }

  public joinExistingOrg() {
    cy.get('algolia-autocomplete').type('newOrganization1');
    cy.get('mat-option').wait(3 * SEC).first().click({force: true});
  }

  public fillOrganizationInformation() {
    cy.get('organization-lite-form mat-select[test-id="activity"]').click();
    cy.get('mat-option').first().click({force: true});
    cy.get('form-country input[test-id="address-country"]').click();
    cy.get('mat-option').first().click({force: true});
  }

  public chooseDashboardAccess() {
    cy.get('organization-lite-form mat-button-toggle-group[test-id="appAccessToggleGroup"]').find;
    cy.get('mat-button-toggle[value="dashboard"]').click();
  }

  public chooseMarketplaceAccess() {
    cy.get('organization-lite-form mat-button-toggle-group[test-id="appAccessToggleGroup"]').find;
    cy.get('mat-button-toggle[value="marketplace"]').click();
  }

  public verifyInformation() {
    cy.get('organization-lite-form mat-select[test-id="activity"]').contains('Actor');
    // cy.get('form-country input[test-id="address-country"]').contains();
  }

}
