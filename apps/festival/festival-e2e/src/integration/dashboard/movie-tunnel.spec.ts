/// <reference types="cypress" />

import { clearDataAndPrepareTest, acceptCookie } from '@blockframes/e2e/utils/functions';
import { signInAndNavigateToMain } from '../../support/utils/utils';
import { 
  mainTest
} from '../../support/movie-tunnel-tests';
import { User, USER } from '@blockframes/e2e/fixtures/users';
import { TO } from '@blockframes/e2e/utils/env';

const userFixture = new User();
const users  =  [ userFixture.getByUID(USER.Jean) ];
let movieURL: string;

describe('User can navigate to the movie tunnel pages start and main.', () => {
  // Log in and create a new movie
  it('User logs in, can navigate to add new title page', () => {
    /*
    cy.on('uncaught:exception', (err, runnable) => {
      expect(err.message).to.include('something about the error');
  
      // using mocha's async done callback to finish
      // this test so we prove that an uncaught exception
      // was thrown
      done();
  
      // return false to prevent the error from
      // failing this test
      return false;
    })
    */
   cy.visit('c/o/marketplace/home');
   cy.wait(3000);
   acceptCookie();
    //clearDataAndPrepareTest('/');
    signInAndNavigateToMain(users[0]);
  });

  // Main page
  it.only('Complete main fields, go on movie tunnel storyline page', () => {
    mainTest();
  });
});
