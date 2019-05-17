/// <reference types="cypress" />

import { LandingPage, HomePage, AddMovieModal, MovieEditPage } from "../support/app.po";

const FORM = {
  [MovieEditPage.FIELD_INTERNATIONAL_TITLE]: 'The terminator',
  [MovieEditPage.FIELD_DIRECTOR_NAME]: 'Bruce',
  [MovieEditPage.FIELD_PRODUCTION_YEAR]: '2019',
};

const EMAIL_CYTEST = 'cytest@gmail.com';
const PASSWORD_CYTEST = 'azerty';
const ORG_CYTEST = 'cytest';
const MOVIE_CYTEST = 'Terminator';

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('macbook-15');
});

describe('Test CRUD movie', () => {
  it('', () => {
    // Connexion
    const p1: LandingPage = new LandingPage();
    p1.fillSigninEmail(EMAIL_CYTEST);
    p1.fillSigninPassword(PASSWORD_CYTEST);
    const p2: HomePage = p1.login();
    p2.assertOrgExists(ORG_CYTEST);
    const p3: AddMovieModal = p2.clickAddMovie(ORG_CYTEST);
    p3.fillMovieName(MOVIE_CYTEST);
    const p4: MovieEditPage = p3.clickCreate();

    //TODO: verifry movie title

    // FORM.forEach(input => {
    //   p4.fillInputValue(input.controlName, input.value);
    //   p4.assertInputAndViewValueExists(input.controlName, input.value);
    // })
    Object.entries(FORM).forEach(input => {
      p4.fillInputValue(input[0], input[1]);
      p4.assertInputAndViewValueExists(input[0], input[1]);
    })

    p4.selectValue('types', ['fiction', 'documentary', 'web-series']);
  });
});
