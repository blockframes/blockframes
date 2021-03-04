import { AuthIdentityPage } from "@blockframes/e2e/pages/auth";
import { clearDataAndPrepareTest, acceptCookie } from "@blockframes/e2e/utils";
import { LandingPage } from "../../support/pages/landing"
import { User, USER } from '@blockframes/e2e/fixtures/users';
import { Orgs } from '@blockframes/e2e/fixtures/orgs';

const userFixture = new User();
const orgsFixture = new Orgs();
const user  = userFixture.getByUID(USER.Vincent);


describe('New user registers', () => {
  beforeEach(() => {
    clearDataAndPrepareTest('/');
    const p1 = new LandingPage();
    p1.clickSignup();
  })

  it('A new user creates its account and a new organization', () => {
    const p1 = new AuthIdentityPage();
    acceptCookie();
    p1.fillUserInformations(user);
    cy.get('algolia-autocomplete').type('newOrganization');
    cy.get('mat-option[test-id="createNewOrgOption"]').click();
    cy.get('organization-lite-form mat-select[test-id="activity"]').click();
    cy.get('mat-option').first().click({force: true});
    cy.get('form-country input[test-id="address-country"]').click();
    cy.get('mat-option').first().click({force: true});
    cy.get('organization-lite-form mat-button-toggle-group[test-id="appAccessToggleGroup"]').click();
    cy.get('mat-button-toggle[value="marketplace"]').click();
    p1.fillPasswordAndSubmit();
  })
})
