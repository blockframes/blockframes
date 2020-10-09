/// <reference types="cypress" />

import { clearDataAndPrepareTest, setForm, FormOptions, acceptCookie } from '@blockframes/e2e/utils/functions';
import { signInAndNavigateToMain } from '../../support/utils/utils';
import { mainTest } from '../../support/movie-tunnel-tests';
import { User, USER } from '@blockframes/e2e/fixtures/users';

const userFixture = new User();
const users = [ userFixture.getByUID(USER.Jean) ];
let movieURL: string;

const Movie_MainInfo = {
  "international-title": 'Lagerfeld Confidential',
  "original-title": 'Lagerfeld Confidential',
  "content-type": 'TV Film',
  "reference": 'Lagerfeld',
  "release-year": '2007',
  "status": 'Confirmed',
  "country": 'France',
  "language": 'French',
  "genres": 'Documentary',
  "other-genres": 'Real life movie , New cinema{enter}',
  "run-time": 87,
  "screening-status": 'Confirmed',
  "first-name": 'Rodolphe',
  "last-name": 'Marconi',
  "director-status": 'Confirmed',
  "director-category": 'Prestige',
  "director-desc": 'Rodolphe Marconi was born on September 4, 1976 in Paris, France.',
  "film-title": 'Ceci est mon corps (2001)',
  "film-year": '2001'

}

/*
http://localhost:4200/c/o/dashboard/tunnel/movie/1dPPD8KtuGqvQcAytVWx/main


https://github.com/blockframes/blockframes/pull/3862

movie id:
1dPPD8KtuGqvQcAytVWx


http://localhost:4200/c/o/dashboard/tunnel/movie/1dPPD8KtuGqvQcAytVWx/summary

https://github.com/blockframes/blockframes/issues/3887

https://staging.archipelmarket.com/c/o/dashboard/tunnel/movie/jfJsOGNmY4nbgMIBjA8U/main

https://staging.archipelmarket.com/c/o/dashboard/title/P9GQDCuk7wMV6Knddec7/additional

https://github.com/blockframes/blockframes/issues/3419

Real life movie, New Cinema
*/

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
    //mainTest();
    //cy.visit('http://localhost:4200/c/o/dashboard/tunnel/movie/1dPPD8KtuGqvQcAytVWx/main');
    //cy.wait(3000);
    cy.get('h1', {timeout: 30000}).contains('Main Information');
    const formOpt: FormOptions = {
      inputValue: Movie_MainInfo
    }    
    setForm('movie-form-main input, static-select, chips-autocomplete', formOpt);
  });
});
