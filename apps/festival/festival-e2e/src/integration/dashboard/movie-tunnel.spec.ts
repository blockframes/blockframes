/// <reference types="cypress" />

import { clearDataAndPrepareTest } from '@blockframes/e2e/utils/functions';
import { signInAndNavigateToMain } from '../../support/utils/utils';
import { mainTest } from '../../support/movie-tunnel-tests';
import { User, USER } from '@blockframes/e2e/fixtures/users';

const userFixture = new User();
const users = [ userFixture.getByUID(USER.Jean) ];
let movieURL: string;

describe('User can navigate to the movie tunnel pages start and main.', () => {
  // Log in and create a new movie
  it('User logs in, can navigate to add new title page', () => {
    clearDataAndPrepareTest('/');
    signInAndNavigateToMain(users[0]);

    cy.url().then(url => {
      cy.log(`Adding new movie url: ${url}`);
      movieURL = url;
    })
  });

  // Main page
  it('Complete main fields, go on movie tunnel storyline page', () => {
    mainTest();
  });
});
