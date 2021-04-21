/// <reference types="cypress" />

import { clearDataAndPrepareTest, assertMoveTo } from '@blockframes/e2e/utils/functions';
import { LandingPage } from '../../support/pages/landing';
import { HomePage, SearchPage, SelectionPage } from '../../support/pages/marketplace';
import { avails } from '../../fixtures/bucket';
import { User, USER } from '@blockframes/e2e/fixtures/users';
import { SEC } from "@blockframes/e2e/utils/env";

const MOVIE_LIST_PATH = '/c/o/marketplace/title';
const SELECTION_PATH = '/c/o/marketplace/selection';
const movies = [
  { title: 'Bigfoot Family', price: 20000 },
  { title: 'GAZA MON AMOUR', price: 10000 },
  { title: 'Mother Schmuckers', price: 5000 }
];
const specificText = 'Payment schedule: 20% each semester starting at the following from signature date';
const deliveryText = 'Prores file deliver through cloud';
const userFixture = new User();
const user = userFixture.getByUID(USER.Camilla);
const currency = 'US Dollar';

beforeEach(() => {
  clearDataAndPrepareTest('/');
  const p1 = new LandingPage();
  const p2 = p1.clickLogin();
  p2.fillSignin(user);
  p2.clickSignIn();
});

//TODO : Dependent on import function
//Issue #5469: E2E excel import test
describe.skip('Create a new bucket and finalize a new offer', () => {
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
      p2.addToBucket(movie.title);
      cy.log(`${movie.title} added to the bucket`);
      cy.wait(3 * SEC);
      p2.checkMovieCardDisappears(movie.title);
    }
    p1.openSidenavMenuAndNavigate('selection');
    assertMoveTo(SELECTION_PATH);

    // COMPLETE AND SEND A NEW OFFER
    const p3 = new SelectionPage();
    p3.selectCurrency(currency);
    cy.log(`Correctly selected ${currency}`);
    p3.checkNumberOfSection(3);
    movies.forEach((movie, index) => {
      p3.checkTitleContract(movie.title);
      p3.fillPrice(movie.price, index);
      cy.log(`Filled ${movie.price} for the movie ${movie.title}`);
      cy.wait(1 * SEC);
    });
    cy.wait(1 * SEC);
    p3.checkTotalPrice('35,000');
    p3.createNewOffer(specificText, deliveryText);
    assertMoveTo('/c/o/marketplace/selection/congratulations');
    cy.get('catalog-congratulations h1', {timeout: 10 * SEC}).should('contain', 'Your Offer was successfully sent.');
  });
});
