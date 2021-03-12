import { SEC } from '../../utils/env';
import { Organization } from '@blockframes/e2e/utils/type';

export const ORGANIZATION: Organization = {
  id: 'Cy1234',
  name: `Org-${Date.now()}-Cypress`, //? Why is there name and denomination in organization ? there is only denomination in the DB
  email: `dev+${Date.now()}@cascade8.com`,
  address: {
    street: '42 test road',
    zipCode: '69001',
    city: 'Testville',
    country: 'France',
    phoneNumber: '+334 857 953'
  },
  activity: 'Distribution',
  fiscalNumber: '95 14 958 641 215 C',

  bankAccount: {
    address: {
      street: '21 gold street',
      zipCode: '69001',
      city: 'Moneytown',
      country: 'Germany'
    },
    IBAN: 'FR1420041010050500013M02606',
    BIC: 'CCBPFRPPVER',
    bankName: 'Cypress Bank',
    holderName: 'Cypress'
  },

  denomination: {
    full: `Cypress & Party`,
    public: 'Cypress & Party'
  }
};

export default class OrganizationLiteFormPage {
  constructor() {
  }

  public createNewOrg(org: Partial<Organization> = ORGANIZATION) {
    cy.get('algolia-autocomplete').type(org.denomination.full);
    cy.get('mat-option[test-id="createNewOrgOption"]').click();
  }

  public joinExistingOrg(org: Partial<Organization> = ORGANIZATION) {
    cy.get('algolia-autocomplete').type(org.denomination.full);
    cy.get('mat-option').wait(3 * SEC).contains(org.denomination.full).click({force: true});
  }

  public fillOrganizationInformation(org: Partial<Organization> = ORGANIZATION) {
    cy.get('organization-lite-form mat-select[test-id="activity"]').click();
    cy.get('mat-option').contains(org.activity).click({force: true});
    cy.get('form-country input[test-id="address-country"]').click();
    cy.get('mat-option').contains(org.address.country).click({force: true});
  }

  public chooseDashboardAccess() {
    cy.get('organization-lite-form mat-button-toggle-group[test-id="appAccessToggleGroup"]').find;
    cy.get('mat-button-toggle[value="dashboard"]').click();
  }

  public chooseMarketplaceAccess() {
    cy.get('organization-lite-form mat-button-toggle-group[test-id="appAccessToggleGroup"]').find;
    cy.get('mat-button-toggle[value="marketplace"]').click();
  }

  public verifyInformation(org: Partial<Organization>, role: string) {
    cy.get('organization-lite-form mat-select[test-id="activity"]').find.should('contain.value', org.activity);
    cy.get('form-country input[test-id="address-country"]').should('contain.value', org.address.country);
    if (role === "seller") {
      cy.get('organization-lite-form mat-button-toggle-group[test-id="appAccessToggleGroup"]').find;
      cy.get('mat-button-toggle[value="dashboard"]').should('be.selected');
    }
    else {
      cy.get('organization-lite-form mat-button-toggle-group[test-id="appAccessToggleGroup"]').find;
      cy.get('mat-button-toggle[value="marketplace"]').should('be.selected');
    }
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
        cy.get('form-country input[test-id="address-country"]').should('not.be.visible');
        cy.get('organization-lite-form mat-select[test-id="activity"]').should('not.be.visible');
        cy.get('organization-lite-form mat-button-toggle-group[test-id="appAccessToggleGroup"]').should('not.be.visible');
        break;
      case 'activity' :
        this.createNewOrg(org);
        cy.get('form-country input[test-id="address-country"]').click();
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
        cy.get('form-country input[test-id="address-country"]').click();
        cy.get('mat-option').contains(org.address.country).click({force: true});
        break;
    }
  }
}
