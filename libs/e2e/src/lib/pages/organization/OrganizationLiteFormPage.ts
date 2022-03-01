import { SEC } from '../../utils/env';
import { Organization } from '@blockframes/e2e/utils/type';
import { ORGANIZATION } from '../../fixtures/orgs';

export default class OrganizationLiteFormPage {

  // SINGLE FIELD
  public createNewOrg(org: Partial<Organization> = ORGANIZATION) {
    cy.get('algolia-autocomplete').type(org.denomination.full);
    cy.get('mat-option[test-id="new-org"]').click();
  }

  public joinExistingOrg(org: Partial<Organization> = ORGANIZATION) {
    cy.get('algolia-autocomplete').type(org.denomination.full);
    cy.get('mat-option').wait(3 * SEC).contains(org.denomination.full).click({force: true});
  }

  public chooseDashboardAccess() {
    cy.get('organization-lite-form mat-button-toggle-group[test-id="appAccessToggleGroup"]')
      .get('mat-button-toggle[value="dashboard"]').click();
  }

  public chooseMarketplaceAccess() {
    cy.get('organization-lite-form mat-button-toggle-group[test-id="appAccessToggleGroup"]')
      .get('mat-button-toggle[value="marketplace"]').click();
  }

  // PARTIAL OR ENTIRE ORG FORM
  public fillOrganizationInformation(org: Partial<Organization> = ORGANIZATION) {
    cy.get('organization-lite-form mat-select[test-id="activity"]').click();
    cy.get('mat-option').contains(org.activity).click({force: true});
    cy.get('static-select[test-id="address-country"]').click();
    cy.get('mat-option').contains(org.address.country).click({force: true});
  }

  public createNewDashboardOrg(org: Organization = ORGANIZATION) {
    this.createNewOrg(org);
    this.fillOrganizationInformation(org);
    this.chooseDashboardAccess();
  }

  public createNewMarketplaceOrg(org: Organization = ORGANIZATION) {
    this.createNewOrg(org);
    this.fillOrganizationInformation(org);
    this.chooseMarketplaceAccess();
  }

  public fillAllExceptOne(org: Partial<Organization>, key) {
    switch (key) {
      case 'denomination' :
        cy.get('static-select[test-id="address-country"]').should('not.exist');
        cy.get('organization-lite-form mat-select[test-id="activity"]').should('not.exist');
        cy.get('organization-lite-form mat-button-toggle-group[test-id="appAccessToggleGroup"]').should('not.exist');
        break;
      case 'activity' :
        this.createNewOrg(org);
        cy.get('static-select[test-id="address-country"]').click();
        cy.get('mat-option').contains(org.address.country).click({force: true});
        this.chooseDashboardAccess();
        break;
      case 'nationality' :
        this.createNewOrg(org);
        cy.get('organization-lite-form mat-select[test-id="activity"]').click();
        cy.get('mat-option').contains(org.activity).click({force: true});
        this.chooseDashboardAccess();
        break;
      case 'role' :
        this.createNewOrg(org);
        cy.get('organization-lite-form mat-select[test-id="activity"]').click();
        cy.get('mat-option').contains(org.activity).click({force: true});
        cy.get('static-select[test-id="address-country"]').click();
        cy.get('mat-option').contains(org.address.country).click({force: true});
        break;
    }
  }

  // VERIFICATION
  //! When user wants to join an org, that should verify that all fields except the company name are prefilled by algolia data
  //! but it doesn't work right now :/
  /** Verify for an organization if fields are prefilled and disabled when user selected an existing one */
  public verifyInformation(org: Partial<Organization>, role: string) {
    cy.get('organization-lite-form mat-select[test-id="activity"]').should('contain.value', org.activity);
    cy.get('organization-lite-form mat-select[test-id="activity"]').should('be.disabled');
    cy.get('static-select[test-id="address-country"]').should('contain.value', org.address.country);
    cy.get('static-select[test-id="address-country"]').should('be.disabled');
    if (role === "seller") {
      cy.get('organization-lite-form mat-button-toggle-group[test-id="appAccessToggleGroup"]')
        .get('mat-button-toggle[value="dashboard"]').should('be.selected');
      cy.get('mat-button-toggle[value="dashboard"]').should('be.disabled');
    }
    else {
      cy.get('organization-lite-form mat-button-toggle-group[test-id="appAccessToggleGroup"]')
        .get('mat-button-toggle[value="marketplace"]').should('be.selected');
      cy.get('mat-button-toggle[value="marketplace"]').should('be.disabled');
    }
  }
}
