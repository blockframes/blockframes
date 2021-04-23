/// <reference types="cypress" />

import { LandingPage } from '../../support/pages/landing';
import { User, USER } from '@blockframes/e2e/fixtures/users';
import { clearDataAndPrepareTest } from "@blockframes/e2e/utils/functions";
import { AuthLoginPage } from "@blockframes/e2e/pages/auth";

import { SEC } from "@blockframes/e2e/utils/env";

const userFixture = new User();
const users  =  [ userFixture.getByUID(USER.Hettie) ];

const movieFixture = 'movie.xlsx';
const contractFixture = 'contract.xlsx';
const movieRecords = 5;
const contractRecords = 19;

const logInAdminAndNavigate = () => {
  const loginPage: AuthLoginPage = new AuthLoginPage();
  loginPage.fillSignin(users[0]);
  loginPage.clickSignIn();

  //cy.url().contains("marketplace/home", {timeout: 60 * SEC});
  cy.location('pathname', {timeout: 120 * SEC})
    .should('include', '/marketplace/home');

  cy.log("Switch to dashboard home");
  //Reach dashboard home
  cy.get('catalog-marketplace button[test-id=menu]', {timeout: 3 * SEC})
    .first().click();
  cy.get('aside a[routerlink="/c/o/dashboard/home"]', {timeout: 0.5 * SEC})
    .click();
  cy.wait(5 * SEC);
  cy.get('aside a[routerlink="title"]', {timeout: 5 * SEC})
    .click();

  cy.get('catalog-dashboard h1', {timeout: 60 * SEC})
    .contains("My Titles");

  cy.log("Navigate to import page");
  cy.get('a[test-id="import-titles"]', {timeout: 30 * SEC})
    .click();
}

describe('User can fill and save contract tunnel form', () => {
  beforeEach(() => {
    clearDataAndPrepareTest();
    cy.visit('/');
    const p1 = new LandingPage();
    p1.clickLogin();
  });
  
  it('Login as admin, Select Movies and import ', () => {
    logInAdminAndNavigate();

    cy.wait(1 * SEC);

    cy.log("Select movie type to upload");
    cy.get('mat-form-field', {timeout: 30 * SEC})
      .click();
    
    cy.get('mat-option')
      .contains("Movies")
      .click();
      
    //Import the Movie file here: filePicker
    cy.log("Start upload by attaching the fixture");
    cy.get('#filePicker', {timeout: 10 * SEC})
      .attachFile(movieFixture);

    cy.get('[test-id="status-import"]', { timeout: 30 * SEC })
      .should('be.visible')
      .should('contain', 'File uploaded');

    cy.log("Movies uploaded successfully; Starting import..");

    cy.get('button[test-id="start-import"]', { timeout: 30 * SEC })
      .click();

    cy.log("Check if we reached submission container");
    cy.wait(3 * SEC);
    cy.get('h1', {timeout: 30 * SEC})
      .contains("finalizing your submission");

    cy.log(`Check for ${movieRecords} records in the extracted data`);
    cy.get('p[test-id="record-length"]', {timeout: 10 * SEC})
      .contains(`${movieRecords}`);
    
    cy.log("Selecting all records to submit");
    cy.get('[test-id="select-all"]', {timeout: 10 * SEC})
      .click();

    cy.get('button[test-id="submit-records"]', {timeout: 3 * SEC})
      .click();

    cy.wait(5 * SEC);

    cy.log("Movies submitted; navigate back");
    cy.get('button[test-id="cancel-import"]', { timeout: 3 *SEC })
      .click();
  });

  it('Login as admin, Select contracts and import ', () => {
    logInAdminAndNavigate();

    cy.wait(1 * SEC);

    cy.log("Select Contract type to upload");
    cy.get('mat-form-field', {timeout: 30 * SEC})
      .click();
    
    cy.get('mat-option')
      .contains("Contract")
      .click();
      
    //Import the Movie file here: filePicker
    cy.log("Start upload by attaching the fixture");
    cy.get('#filePicker', {timeout: 10 * SEC})
      .attachFile(contractFixture);

    cy.get('[test-id="status-import"]', { timeout: 30 * SEC })
      .should('be.visible')
      .should('contain', 'File uploaded');

    cy.log("Movies uploaded successfully; Starting import..");

    cy.get('button[test-id="start-import"]', { timeout: 30 * SEC })
      .click();

    cy.log("Check if we reached submission container");
    cy.wait(30 * SEC);
    cy.get('h1', {timeout: 30 * SEC})
      .contains("finalize your import");

    cy.log(`Check for ${contractRecords} records in the extracted data`);
    cy.get('p[test-id="record-length"]', {timeout: 150 * SEC})
      .contains(`${contractRecords}`);
    
    cy.log("Selecting all records to submit");
    cy.get('[test-id="select-all"]', {timeout: 10 * SEC})
      .click();

    cy.get('button[test-id="submit-records"]', {timeout: 3 * SEC})
      .click();

    cy.wait(5 * SEC);

    cy.log("Contracts submitted; navigate back");
    cy.get('button[test-id="cancel-import"]', { timeout: 3 *SEC })
      .click();
  });
});
