/// <reference types="cypress" />

import { HomePage } from "../../support/pages/marketplace";
import { LandingPage } from '../../support/pages/landing';
import { TunnelContractLobbyPage, TunnelContractPage, TunnelContractSummaryPage } from "../../support/pages/dashboard";
import { User, USER } from '@blockframes/e2e/fixtures/users';
import { clearDataAndPrepareTest } from "@blockframes/e2e/utils/functions";
import { AuthLoginPage } from "@blockframes/e2e/pages/auth";

const userFixture = new User();
const users  =  [ userFixture.getByUID(USER.Hettie) ];


describe('User can fill and save contract tunnel form', () => {
  beforeEach(() => {
    clearDataAndPrepareTest('/');
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

    cy.get('a["Import titles in bulk"]')
      .click();


  });
});
