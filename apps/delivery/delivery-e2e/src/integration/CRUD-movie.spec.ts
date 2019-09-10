/// <reference types="cypress" />

import { LoginPage, HomePage, AddMovieModal, MovieEditPage, LandingPage, MovieCreatePage } from "../support/pages";
import { User } from "../support/utils/type";

// CONSTS

const INPUTS_FORM = {
  [MovieEditPage.FIELD_INTERNATIONAL_TITLE]: 'The terminator',
  [MovieEditPage.FIELD_DIRECTORS]: ['Bruce'],
  [MovieEditPage.FIELD_PRODUCTION_YEAR]: '2019',
};

const OPTIONS_FORM = {
  [MovieEditPage.OPTION_TYPES]: ['fiction', 'documentary'],
  [MovieEditPage.OPTION_GENRES]: ['thriller', 'horror'],
  [MovieEditPage.OPTION_ORIGIN_COUNTRIES]: ['france'],
  [MovieEditPage.OPTION_PRODUCER_COUNTRY]: ['france'],
  [MovieEditPage.OPTION_LANGUAGES]: ['french'],
  [MovieEditPage.OPTION_STATUS]: ['shooting']
};

const LOGIN_CREDENTIALS: Partial<User> = {
  email: 'cypressCRUDMOVIE@blockframes.com',
  password: 'blockframes'
}

const MOVIES_CYTEST = ['Terminator', 'Kung Fury', 'Starship Troopers'];

// TEST

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('ipad-2', 'landscape');
});

describe('Test CRUD movie', () => {
  it('should login, create a movie, edit this movie, create a second movie, then delete both', () => {
    // Connexion
    const p1: LandingPage = new LandingPage();
    const p2: LoginPage = p1.clickCallToAction();

    p2.fillSignin(LOGIN_CREDENTIALS);
    const p3: MovieCreatePage = p2.clickSignin();

    // Create a movie
    const p4: AddMovieModal = p3.clickAddMovie();
    p4.fillMovieName(MOVIES_CYTEST[0]);
    const p5: MovieEditPage = p4.clickCreate();

    // // Add informations and verify the entry
    // p5.assertMovieTitleExists(MOVIE_CYTEST);
    // Object.entries(INPUTS_FORM).forEach(input => {
    //   p5.fillInputValue(input[0], input[1]);
    //   p5.assertInputAndViewValueExists(input[0], input[1]);
    // });
    // Object.entries(OPTIONS_FORM).forEach(option => {
    //   p5.selectOptions(option[0], option[1]);
    //   p5.assertOptionsExist(option[1]);
    // });
    // p5.clickSaveMovie();

    // // Go to home page and comeback to verify saved informations
    // const p6: HomePage = p5.clickHome();
    // p6.displayMovieMenu(MOVIE_CYTEST);
    // const p7: MovieEditPage = p6.clickEdit();
    // Object.entries(INPUTS_FORM).forEach(input => {
    //   p7.assertInputAndViewValueExists(input[0], input[1]);
    // });
    // Object.entries(OPTIONS_FORM).forEach(option => {
    //   p7.assertOptionsExist(option[1]);
    // });

    // // Go to home page and delete the movie
    // const p8: HomePage = p7.clickHome();
    // p8.displayMovieMenu(MOVIE_CYTEST);
    // p8.clickDelete();
    // p8.assertMovieNotExists(MOVIE_CYTEST);
  });
});
