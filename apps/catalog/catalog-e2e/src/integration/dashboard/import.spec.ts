/// <reference types="cypress" />

import { User as UserType } from '@blockframes/e2e/utils/type';
import { User, USER } from '@blockframes/e2e/fixtures/users';
import { assertMoveTo } from '@blockframes/e2e/utils/functions';

import { SEC } from '@blockframes/e2e/utils/env';

const MY_TITLES_PAGE = '/c/o/dashboard/title';
const MY_SALES_PAGE = '/c/o/dashboard/sales';

const userFixture = new User();
const [jean, vincent]  =  [ userFixture.getByUID(USER.Jean),
                  userFixture.getByUID(USER.Vincent)
                ];

const movieFixture = 'movie.xlsx';
const contractFixture = 'contract.xlsx';
const movieRecords = 5;
const contractRecords = 19;

const MOVIE_IMPORT_TIMEOUT = 120 * SEC;
const CONTRACT_IMPORT_TIMEOUT = 240 * SEC;

const logInAndNavigate = (user: Partial<UserType>) => {
  cy.log('Log in with user Jean');
  cy.login(user.email, user.password);
  cy.visit('/c/o/marketplace/home');

  cy.location('pathname', {timeout: 120 * SEC})
    .should('include', '/marketplace/home');

  cy.log('Switch to dashboard home');
  //Reach dashboard home
  cy.get('catalog-marketplace button[test-id=menu]', {timeout: 60 * SEC})
    .first().click();
  cy.get('aside a[routerlink="/c/o/dashboard/home"]', {timeout: 3 * SEC})
    .click();
  cy.wait(5 * SEC);
}

describe('User can fill and save contract tunnel form', () => {
  beforeEach(() => {
    cy.viewport('ipad-2', 'landscape');
  });

  it('Login as Dashboard user, Select Movies and import ', () => {
    logInAndNavigate(jean);

    cy.get('aside a[routerlink="title"]', {timeout: 5 * SEC})
      .click();

    assertMoveTo(MY_TITLES_PAGE);

    cy.log('Navigated to import title page');
    cy.get('a[test-id="import-titles"]', {timeout: 30 * SEC})
      .click();

    cy.wait(1 * SEC);

    //Import the Movie file here
    cy.log('Start upload by attaching the fixture');
    cy.get('input', {timeout: 10 * SEC})
      .attachFile(movieFixture);

    cy.log(`Check for ${movieRecords} records in the extracted data`);
    cy.get('p[test-id="record-length"]', {timeout: MOVIE_IMPORT_TIMEOUT})
      .contains(`${movieRecords}`);

    cy.log('Selecting all records to submit');
    cy.get('[test-id="select-all"]', {timeout: 10 * SEC})
      .click();

    cy.get('button[test-id="submit-records"]', {timeout: 3 * SEC})
      .click();

    cy.wait(30 * SEC);

    cy.log('Movies submitted; navigate back');
    cy.get('button[test-id="cancel-import"]', { timeout: 3 *SEC })
      .click();

    cy.logout();
  });

  // TODO correct the test once the contract import page is ready #6757
  it('Login as admin, Select contracts and import ', () => {
    logInAndNavigate(vincent);
    cy.wait(1 * SEC);

    cy.get('aside a[routerlink="sales"]', {timeout: 5 * SEC})
      .click();

    assertMoveTo(MY_SALES_PAGE);

    cy.log('Navigated to import contracts page');
    cy.get('a[test-id="import-contracts"]', {timeout: 30 * SEC})
      .click();

    cy.wait(1 * SEC);

    //Import the Movie file here
    cy.log('Start upload by attaching the fixture');
    cy.get('input', {timeout: 10 * SEC})
      .attachFile(contractFixture);

    cy.log(`Check for ${contractRecords} records in the extracted data`);
    cy.get('p[test-id="record-length"]', {timeout: CONTRACT_IMPORT_TIMEOUT})
      .contains(`${contractRecords}`);

    cy.log('Selecting all records to submit');
    cy.get('[test-id="select-all"]', {timeout: 10 * SEC})
      .click();

    cy.get('button[test-id="submit-records"]', {timeout: 3 * SEC})
      .click();

    cy.wait(30 * SEC);

    cy.log('Contracts submitted; navigate back');
    cy.get('button[test-id="cancel-import"]', { timeout: 3 *SEC })
      .click();

    cy.logout();
  });
});
