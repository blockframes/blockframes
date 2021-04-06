/// <reference types="cypress" />

import { HomePage } from "../../support/pages/marketplace";
import { LandingPage } from '../../support/pages/landing';
import { User, USER } from '@blockframes/e2e/fixtures/users';
import { clearDataAndPrepareTest } from "@blockframes/e2e/utils/functions";
import { AuthLoginPage } from "@blockframes/e2e/pages/auth";

import { SEC } from "@blockframes/e2e/utils/env";

const userFixture = new User();
const users  =  [ userFixture.getByUID(USER.Hettie) ];


describe('User can fill and save contract tunnel form', () => {
  beforeEach(() => {
    clearDataAndPrepareTest('c/o/dashboard/home');
    //cy.visit('/');
    //const p1 = new LandingPage();
    //p1.clickLogin();
  });
  
  it('Login as admin, Select contracts and import ', () => {
    // Connexion
    //const p2: AuthLoginPage = new AuthLoginPage();
    //p2.fillSignin(users[0]);
    //p2.clickSignIn();
    //const p3 = new HomePage();

    // Navigate to tunnel-contract
    //TODO: Check if we are in marketplace and switch to dashboard

    cy.get('a[test-id="import-titles"]', {timeout: 30 * SEC})
      .click();

    cy.wait(1 * SEC);

    cy.get('mat-form-field', {timeout: 30 * SEC})
      .click();
    
    cy.get('mat-option')
      .contains("Contracts")
      .click();
  });
});
