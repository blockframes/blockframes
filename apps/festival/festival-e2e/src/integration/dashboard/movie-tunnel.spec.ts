/// <reference types="cypress" />

import { FestivalDashboardHomePage } from "../../support/pages/dashboard";
import { LandingPage } from "../../support/pages/landing";
//import { TunnelContractLobbyPage, TunnelContractPage, TunnelContractSummaryPage } from "../../support/pages/dashboard";
import { User } from "@blockframes/e2e/utils/type";
import { USERS } from "@blockframes/e2e/utils/users";
import { clearDataAndPrepareTest, signIn } from "@blockframes/e2e/utils/functions";
import { AuthLoginPage } from "@blockframes/e2e/pages/auth";

// Select user: david.ewing@gillespie-lawrence.fake.cascade8.com
const LOGIN_CREDENTIALS: Partial<User> = USERS[0];

const EVENT = 'Contract Signature Date';
const EVENT_SUMMARY = 'ContractSignatureDate';
const DURATION = '90';
const PERIOD = 'Months';
const PERIOD_SUMMARY = 'months';
const CURRENCY = 'Euro';
const CURRENCY_SUMMARY = 'EUR';
const PACKAGE_PRICE = '1000000';
const PACKAGE_PRICE_SUMMARY = '€1,000,000.00';
const PERCENTAGE = '60';
const TRIGGERING_EVENT = 'First theatrical release';

describe('Add Title Suite', () => {
  beforeEach(() => {
    clearDataAndPrepareTest('/');
    const p1: LandingPage = new LandingPage();
    const p2: AuthLoginPage = p1.clickLogin();
    
    //p2.switchMode();
    //signIn(LOGIN_CREDENTIALS);
    p2.fillSignin(LOGIN_CREDENTIALS);
    p2.clickSignIn();    
    cy.wait(1000);
    cy.visit('c/o/dashboard/home');
  });
  
  it('Login into an existing account, navigate on titles list page, go to movie tunnel page 1, go on movie tunnel page 2', () => {
    // Connexion
    const p1 = new FestivalDashboardHomePage();

    // Add a new Title
    cy.get('.mat-button-wrapper').contains('Add one title').click();

  });
});
