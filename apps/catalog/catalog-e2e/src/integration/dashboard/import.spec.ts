/// <reference types="cypress" />

import { User, USER } from '@blockframes/e2e/fixtures/users';
import { assertMoveTo } from "@blockframes/e2e/utils/functions";

import { SEC } from "@blockframes/e2e/utils/env";

const MY_TITLES_PAGE = '/c/o/dashboard/title';

const userFixture = new User();
const users  =  [ userFixture.getByUID(USER.Vincent) ];

const movieFixture = 'movie.xlsx';
const contractFixture = 'contract.xlsx';
const movieRecords = 5;
const contractRecords = 19;

const MOVIE_IMPORT_TIMEOUT = 120 * SEC;
const CONTRACT_IMPORT_TIMEOUT = 240 * SEC;

const logInAdminAndNavigate = () => {
  cy.log("Log in Admin user Vincent");
  cy.login(users[0].email, users[0].password);
  cy.visit('/c/o/marketplace/home');

  cy.location('pathname', {timeout: 120 * SEC})
    .should('include', '/marketplace/home');

  cy.log("Switch to dashboard home");
  //Reach dashboard home
  cy.get('catalog-marketplace button[test-id=menu]', {timeout: 60 * SEC})
    .first().click();
  cy.get('aside a[routerlink="/c/o/dashboard/home"]', {timeout: 3 * SEC})
    .click();
  cy.wait(5 * SEC);
  cy.get('aside a[routerlink="title"]', {timeout: 5 * SEC})
    .click();

  assertMoveTo(MY_TITLES_PAGE);

  cy.log("Navigate to import page");
  cy.get('a[test-id="import-titles"]', {timeout: 30 * SEC})
    .click();
}

//TODO : Issue: 6757 - Handle new ui change and get it working
describe.skip('User can fill and save contract tunnel form', () => {
  beforeEach(() => {
    cy.viewport('ipad-2', 'landscape');
  });

  it('Login as admin, Select Movies and import ', () => {
    logInAdminAndNavigate();
    cy.wait(1 * SEC);

    cy.log("Select movie type to upload");
    cy.get('mat-form-field', {timeout: 30 * SEC})
      .click();

    cy.get('mat-option')
      .contains("Titles")
      .click();

    //Import the Movie file here
    cy.log("Start upload by attaching the fixture");
    cy.get('#filePicker', {timeout: 10 * SEC})
      .attachFile(movieFixture);

    cy.get('[test-id="status-import"]', { timeout: 30 * SEC })
      .should('be.visible')
      .should('contain', 'File uploaded');

    cy.log("Movie File uploaded successfully; Starting import..");

    cy.get('button[test-id="start-import"]', { timeout: 30 * SEC })
      .click();

    cy.log("Check if we reached submission container");
    cy.wait(3 * SEC);
    cy.get('h1', {timeout: 30 * SEC})
      .contains("finalizing your submission");

    cy.log(`Check for ${movieRecords} records in the extracted data`);
    cy.get('p[test-id="record-length"]', {timeout: MOVIE_IMPORT_TIMEOUT})
      .contains(`${movieRecords}`);

    cy.log("Selecting all records to submit");
    cy.get('[test-id="select-all"]', {timeout: 10 * SEC})
      .click();

    cy.get('button[test-id="submit-records"]', {timeout: 3 * SEC})
      .click();

    cy.wait(30 * SEC);

    cy.log("Movies submitted; navigate back");
    cy.get('button[test-id="cancel-import"]', { timeout: 3 *SEC })
      .click();

    cy.logout();
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

    //Import the Contracts file here
    cy.log("Start upload by attaching the fixture");
    cy.get('#filePicker', {timeout: 10 * SEC})
      .attachFile(contractFixture);

    cy.get('[test-id="status-import"]', { timeout: 30 * SEC })
      .should('be.visible')
      .should('contain', 'File uploaded');

    cy.log("Contract File uploaded successfully; Starting import..");

    cy.get('button[test-id="start-import"]', { timeout: 30 * SEC })
      .click();

    cy.log("Check if we reached submission container");
    cy.wait(30 * SEC);
    cy.get('h1', {timeout: 30 * SEC})
      .contains("finalize your import");

    cy.log(`Check for ${contractRecords} records in the extracted data`);
    cy.get('p[test-id="record-length"]', {timeout: CONTRACT_IMPORT_TIMEOUT})
      .contains(`${contractRecords}`);

    cy.log("Selecting all records to submit");
    cy.get('[test-id="select-all"]', {timeout: 10 * SEC})
      .click();

    cy.get('button[test-id="submit-records"]', {timeout: 3 * SEC})
      .click();

    cy.wait(30 * SEC);

    cy.log("Contracts submitted; navigate back");
    cy.get('button[test-id="cancel-import"]', { timeout: 3 *SEC })
      .click();

    cy.logout();
  });
});
