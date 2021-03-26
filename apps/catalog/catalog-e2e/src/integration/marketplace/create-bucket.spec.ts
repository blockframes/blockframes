/// <reference types="cypress" />

import { clearDataAndPrepareTest, assertMoveTo } from '@blockframes/e2e/utils/functions';
import { LandingPage } from '../../support/pages/landing';
import { HomePage, SearchPage, SelectionPage } from '../../support/pages/marketplace';
import { avails } from '@blockframes/e2e/fixtures/bucket';
import { User, USER } from '@blockframes/e2e/fixtures/users';
import { SEC } from "@blockframes/e2e/utils/env";

const MOVIE_LIST_PATH = '/c/o/marketplace/title';
const SELECTION_PATH = '/c/o/marketplace/selection';
const movies = ['Bigfoot Family', 'GAZA MON AMOUR', 'Mother Schmuckers']
const userFixture = new User();
const user = userFixture.getByUID(USER.Vincent);

beforeEach(() => {
  clearDataAndPrepareTest('/');
  const p1 = new LandingPage();
  const p2 = p1.clickLogin();
  p2.fillSignin(user);
  p2.clickSignIn();
});

describe('Create a new bucket', () => {
  it.skip('Log in, go to the library page and add movie to the bucket', () => {
    const p1 = new HomePage();
    p1.openSidenavMenuAndNavigate('library');
    const p2 = new SearchPage();
    assertMoveTo(MOVIE_LIST_PATH);
    cy.wait(3 * SEC);
    p2.fillAvailFilter(avails);
    cy.wait(3 * SEC);
    // for(const movie of movies) {
      // p2.addToBucket(movie);
    // }
    // p1.openSidenavMenuAndNavigate('selection');
    // assertMoveTo(SELECTION_PATH);
  });

  it('Check selection page and create offer', () => {
    const p1 = new HomePage();
    p1.openSidenavMenuAndNavigate('selection');
    assertMoveTo(SELECTION_PATH);
    const p2 = new SelectionPage();
    cy.wait(3 * SEC);
    p2.selectCurrency();
    p2.fillPrice(500);
    p2.checkNumberOfSection(2);
    p2.checkTitleAndOffer(movies[1], 2);
    p2.checkTitleAndOffer(movies[0], 1);
  });
});
