/// <reference types="cypress" />

import { clearDataAndPrepareTest, assertMoveTo } from '@blockframes/e2e/utils/functions';
import { LandingPage } from '../../support/pages/landing';
import { HomePage, SearchPage, SelectionPage } from '../../support/pages/marketplace';
import { avails } from '@blockframes/e2e/fixtures/bucket';
import { User, USER } from '@blockframes/e2e/fixtures/users';
import { SEC } from "@blockframes/e2e/utils/env";

const MOVIE_LIST_PATH = '/c/o/marketplace/title';
const SELECTION_PATH = '/c/o/marketplace/selection';
const movies = ['Bigfoot Family', 'GAZA MON AMOUR', 'Mother Schmuckers'];
const specificText = 'Payment schedule: 20% each semester starting at the following from signature date';
const deliveryText = 'Prores file deliver through cloud';
const userFixture = new User();
const user = userFixture.getByUID(USER.Camilla);

beforeEach(() => {
  clearDataAndPrepareTest('/');
  const p1 = new LandingPage();
  const p2 = p1.clickLogin();
  p2.fillSignin(user);
  p2.clickSignIn();
});

describe('Create a new bucket and finalize a new offer', () => {
  it('Log in, go to the library page, add movie to the bucket and create an offer', () => {
    const p1 = new HomePage();
    p1.openSidenavMenuAndNavigate('library');

    // CREATE NEW BUCKET BY ADDING MOVIES TO IT
    const p2 = new SearchPage();
    assertMoveTo(MOVIE_LIST_PATH);
    cy.wait(3 * SEC);
    p2.fillAvailFilter(avails);
    cy.wait(3 * SEC);
    for(const movie of movies) {
      p2.addToBucket(movie);
      cy.wait(3 * SEC);
      p2.checkMovieCardDisappears(movie);
    }
    p1.openSidenavMenuAndNavigate('selection');
    assertMoveTo(SELECTION_PATH);

    // COMPLETE AND SEND A NEW OFFER
    const p3 = new SelectionPage();
    p3.selectCurrency('US Dollar');
    p3.checkNumberOfSection(3);
    movies.forEach((movie, index) => {
      p3.checkTitleContract(movie);
      switch(movie) {
        case 'Bigfoot Family':
          p3.fillPrice(20000, index);
          break;
        case 'GAZA MON AMOUR':
          p3.fillPrice(10000, index);
          break;
        case 'Mother Schmuckers':
          p3.fillPrice(5000, index);
          break;
      }
    });
    p3.checkTotalPrice('35,000');
    p3.createNewOffer(specificText, deliveryText);
    assertMoveTo('/c/o/marketplace/selection/congratulations');
    cy.get('catalog-congratulations h1').should('contain', 'Your Contract Offer has been successfully sent');
  });
});

describe.skip('Log in as Blockframes Admin and import contracts', () => {
  it('Log in as Blockframes Admin and import contracts', () => {
    const p1 = new HomePage();
    p1.openSidenavMenuAndNavigate('dashboard');
    assertMoveTo('/c/o/dashboard/home');
    cy.get('dashboard-home');
    cy.get('dashboard-home a[test-id="import"]').click();
    assertMoveTo('/c/o/dashboard/import');
    cy.get('import-spreadsheet mat-select[test-id="import-select"]').click()
    cy.get('mat-option').contains('Contracts').click();
    cy.get('import-spreadsheet a').contains('Import File').click();
  })
});
